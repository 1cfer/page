CREATE TABLE IF NOT EXISTS roles (
  id UUID NOT NULL,
  name VARCHAR(20) NOT NULL,
  description VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT roles_pkey PRIMARY KEY (id),
  CONSTRAINT roles_role_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS users_roles (
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT users_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT users_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT users_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS devices (
  id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT devices_pkey PRIMARY KEY (id),
  CONSTRAINT devices_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS sensor_types (
  id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT sensor_types_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_types_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS sensors (
  id UUID NOT NULL,
  name VARCHAR(100) NULL,
  state VARCHAR(40) NULL,
  lat float8 NULL,
  lng float8 NULL,
  installation_date DATE DEFAULT NOW(),
  device_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT sensors_name_key UNIQUE (name),
  CONSTRAINT sensors_pkey PRIMARY KEY (id),
  CONSTRAINT sensors_device_id_fkey FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS measurements_time_series (
  id UUID NOT NULL,
  sensor_id UUID NOT NULL,
  measure_date DATE DEFAULT NOW(),
  measure_max numeric(10, 2) NOT NULL,
  measure_min numeric(10, 2) NOT NULL,
  measure_mean numeric(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT measurements_time_series_pkey PRIMARY KEY (id),
  CONSTRAINT measurements_time_series_id_sensor_fkey FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS measurements (
  id UUID NOT NULL,
  sensor_id UUID NOT NULL,
  measure_date DATE DEFAULT NOW(),
  value numeric(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT measurements_pkey PRIMARY KEY (id),
  CONSTRAINT measurements_id_sensor_fkey FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE ON UPDATE CASCADE
);
