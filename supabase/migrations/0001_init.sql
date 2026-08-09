-- Smart Shopping Tracker — initial schema
-- Products, purchases and purchase line items, plus the purchase-scoring
-- transaction (see apply_purchase below) that implements the 0-10 priority
-- score: +1 when a product appears in a purchase, -1 for every existing
-- product that doesn't, clamped to [0, 10]. New products start at 1.

create extension if not exists pgcrypto;

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  priority_score smallint not null default 1 check (priority_score between 0 and 10),
  times_purchased integer not null default 0,
  total_spent numeric(10, 2) not null default 0,
  last_purchased_at date,
  created_at timestamptz not null default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  purchased_at date not null default current_date,
  store text,
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  product_name text not null,
  quantity numeric(10, 2) not null default 1,
  price numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index purchase_items_purchase_id_idx on purchase_items (purchase_id);
create index purchase_items_product_id_idx on purchase_items (product_id);
create index purchases_purchased_at_idx on purchases (purchased_at desc);
create index products_priority_score_idx on products (priority_score desc);

-- Records a confirmed purchase and applies the scoring rules to every
-- product atomically: matched products +1 (and their stats), everything
-- else -1. p_items is a jsonb array of {name, quantity, price, category?}.
create or replace function apply_purchase(
  p_purchased_at date,
  p_store text,
  p_items jsonb
) returns uuid
language plpgsql
as $$
declare
  v_purchase_id uuid;
  v_total numeric(10, 2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_name text;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'purchase must contain at least one item';
  end if;

  select coalesce(sum((i ->> 'price')::numeric), 0)
    into v_total
    from jsonb_array_elements(p_items) i;

  insert into purchases (purchased_at, store, total)
  values (coalesce(p_purchased_at, current_date), p_store, v_total)
  returning id into v_purchase_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_name := trim(v_item ->> 'name');

    select id into v_product_id from products where lower(name) = lower(v_name);

    if v_product_id is null then
      insert into products (name, category, priority_score, times_purchased, total_spent, last_purchased_at)
      values (
        v_name,
        nullif(v_item ->> 'category', ''),
        1,
        1,
        (v_item ->> 'price')::numeric,
        p_purchased_at
      )
      returning id into v_product_id;
    else
      update products set
        priority_score = least(10, priority_score + 1),
        times_purchased = times_purchased + 1,
        total_spent = total_spent + (v_item ->> 'price')::numeric,
        last_purchased_at = p_purchased_at,
        category = coalesce(nullif(v_item ->> 'category', ''), category)
      where id = v_product_id;
    end if;

    insert into purchase_items (purchase_id, product_id, product_name, quantity, price)
    values (
      v_purchase_id,
      v_product_id,
      v_name,
      coalesce((v_item ->> 'quantity')::numeric, 1),
      coalesce((v_item ->> 'price')::numeric, 0)
    );
  end loop;

  update products
  set priority_score = greatest(0, priority_score - 1)
  where id not in (
    select product_id from purchase_items where purchase_id = v_purchase_id
  );

  return v_purchase_id;
end;
$$;

-- RLS is enabled with no policies: all access goes through the Next.js
-- server using the service-role key, never the anon/public key.
alter table products enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
