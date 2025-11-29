DROP TABLE IF EXISTS Bookings, Passengers, Flights, Schedules, Aircrafts, Aircraft_Models, Airlines, Airports, Users CASCADE;
    
    CREATE TABLE Airlines (
        airline_id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        iata_code VARCHAR(2) UNIQUE NOT NULL,
        logo_url VARCHAR(255)
    );
    
    CREATE TABLE Aircraft_Models (
        model_id SERIAL PRIMARY KEY,
        model_name VARCHAR(255) UNIQUE NOT NULL,
        capacity INT NOT NULL
    );
    
    CREATE TABLE Airports (
        airport_id SERIAL PRIMARY KEY,
        airport_name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        iata_code VARCHAR(3) UNIQUE NOT NULL
    );
    
    CREATE TABLE Users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'agent', 'admin'))
    );
    
    CREATE TABLE Aircrafts (
        aircraft_id SERIAL PRIMARY KEY,
        model_id INT NOT NULL REFERENCES Aircraft_Models(model_id),
        airline_id INT NOT NULL REFERENCES Airlines(airline_id),
        registration_number VARCHAR(100) UNIQUE NOT NULL
    );
    
    CREATE TABLE Schedules (
        schedule_id SERIAL PRIMARY KEY,
        flight_number VARCHAR(10) NOT NULL,
        departure_airport_id INT NOT NULL REFERENCES Airports(airport_id),
        arrival_airport_id INT NOT NULL REFERENCES Airports(airport_id),
        departure_time TIME NOT NULL,
        arrival_time TIME NOT NULL,
        days_of_week INT[] NOT NULL
    );
    
    CREATE TABLE Flights (
        flight_id SERIAL PRIMARY KEY,
        schedule_id INT NOT NULL REFERENCES Schedules(schedule_id),
        aircraft_id INT NOT NULL REFERENCES Aircrafts(aircraft_id),
        departure_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
        arrival_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('On Time', 'Delayed', 'Cancelled', 'Departed', 'Arrived')),
        base_price DECIMAL(10, 2) NOT NULL
    );
    
    CREATE TABLE Passengers (
    passenger_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    birth_date DATE,
    valid_until DATE,
    gender VARCHAR(10),
    document_type VARCHAR(50),
    document_series VARCHAR(50), 
    document_number VARCHAR(255) UNIQUE  NOT NULL, 
    user_id INT REFERENCES Users(user_id),
    
    -- ДОБАВЛЯЕМ СОСТАВНОЙ УНИКАЛЬНЫЙ КЛЮЧ
    CONSTRAINT unique_passenger_document UNIQUE (document_type, document_number)
);
    
    CREATE TABLE Bookings (
        booking_id SERIAL PRIMARY KEY,
        flight_id INT NOT NULL REFERENCES Flights(flight_id),
        passenger_id INT NOT NULL REFERENCES Passengers(passenger_id),
        booking_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        seat_number VARCHAR(4),
        status VARCHAR(50) NOT NULL CHECK (status IN ('Confirmed', 'Cancelled')),
        check_in_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (check_in_status IN ('Pending', 'Checked-in', 'No-show')),
        baggage_option VARCHAR(50) NOT NULL DEFAULT 'no_baggage',
        ticket_number VARCHAR(20) UNIQUE NOT NULL
    );
    
    CREATE INDEX idx_flights_departure_datetime ON Flights(departure_datetime);
    CREATE INDEX idx_airports_city ON Airports(city);


    

    CREATE OR REPLACE FUNCTION generate_flights_for_schedule()
    RETURNS TRIGGER AS $$
    DECLARE
        i INT;
        flight_date DATE;
        day_of_week INT;
    BEGIN
        -- NEW - это специальная переменная, содержащая новую строку, которая была вставлена
        RAISE NOTICE 'Triggered for new schedule_id: %', NEW.schedule_id;

        -- Генерируем рейсы, например, на 30 дней вперед
        FOR i IN 0..29 LOOP
            flight_date := CURRENT_DATE + i;
            day_of_week := EXTRACT(ISODOW FROM flight_date); -- 1=Пн, 7=Вс
            
            -- Проверяем, соответствует ли день недели расписанию
            IF day_of_week = ANY(NEW.days_of_week) THEN
                INSERT INTO flights (schedule_id, aircraft_id, departure_datetime, arrival_datetime, status, base_price)
                VALUES (
                    NEW.schedule_id,
                    -- Выбираем случайный самолет для разнообразия
                    (SELECT aircraft_id FROM aircrafts ORDER BY RANDOM() LIMIT 1),
                    flight_date + NEW.departure_time,
                    -- Обрабатываем перелеты через полночь
                    CASE 
                        WHEN NEW.arrival_time < NEW.departure_time THEN flight_date + NEW.arrival_time + INTERVAL '1 day'
                        ELSE flight_date + NEW.arrival_time
                    END,
                    'On Time',
                    floor(random() * (25000 - 3000 + 1) + 3000)
                );
            END IF;
        END LOOP;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- 2. Создание самого триггера
    -- Сначала удаляем старый, если он есть, чтобы избежать ошибок при повторном запуске скрипта
    DROP TRIGGER IF EXISTS after_schedule_insert ON schedules;

    CREATE TRIGGER after_schedule_insert
    AFTER INSERT ON schedules  -- Запускать ПОСЛЕ вставки...
    FOR EACH ROW              -- ...для каждой вставленной строки
    EXECUTE FUNCTION generate_flights_for_schedule();