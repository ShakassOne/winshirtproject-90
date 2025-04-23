
-- Fonction pour incrémenter une colonne numérique dans une table
CREATE OR REPLACE FUNCTION increment(row_id int, num_increment int, field_name text, table_name text DEFAULT 'lotteries')
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + $1 WHERE id = $2', table_name, field_name, field_name)
  USING num_increment, row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
