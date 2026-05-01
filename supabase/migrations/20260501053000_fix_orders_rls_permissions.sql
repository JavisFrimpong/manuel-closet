-- Fix checkout insert failures caused by missing grants under RLS

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Recreate policies with explicit intent
DROP POLICY IF EXISTS "Anyone can place orders" ON public.orders;
CREATE POLICY "Anyone can place orders"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    btrim(customer_name) <> ''
    AND btrim(customer_phone) <> ''
    AND btrim(delivery_address) <> ''
    AND total_amount > 0
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Anyone can view orders for tracking" ON public.orders;
CREATE POLICY "Anyone can view orders for tracking"
  ON public.orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
CREATE POLICY "Authenticated users can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items"
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    order_id IS NOT NULL
    AND btrim(product_name) <> ''
    AND product_price >= 0
    AND quantity > 0
    AND subtotal >= 0
  );

DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items"
  ON public.order_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grants are still required even when policies exist
GRANT SELECT, INSERT ON TABLE public.orders TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.order_items TO anon, authenticated;
GRANT UPDATE ON TABLE public.orders TO authenticated;
