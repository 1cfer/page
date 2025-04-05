DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'agevital') THEN
        CREATE DATABASE agevital;
    END IF;
END $$;
