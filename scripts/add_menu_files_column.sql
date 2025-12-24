-- Add menu_files column to orders table
-- This column will store an array of file objects with metadata

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS menu_files jsonb DEFAULT '[]'::jsonb;

-- Add comment to document the column structure
COMMENT ON COLUMN public.orders.menu_files IS 
'Array of menu file objects with structure: [{"name": "filename.pdf", "url": "storage_url", "uploadedAt": "timestamp", "uploadedBy": "business|customer"}]';
