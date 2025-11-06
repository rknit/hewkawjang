-- Ensure the publication exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime
            WITH (publish = 'insert, update, delete');
    END IF;
END$$;

-- restaurant
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'restaurant'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant;
    END IF;
END$$;

-- reservation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'reservation'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reservation;
    END IF;
END$$;

-- notification
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'notification'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notification;
    END IF;
END$$;

-- message
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'message'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.message;
    END IF;
END$$;

-- report
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'report'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.report;
    END IF;
END$$;
