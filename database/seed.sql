TRUNCATE TABLE seat_reservations, password_resets, Bookings, Passengers, Flights, Schedules, Aircrafts, Aircraft_Models, Airlines, Airports, Users RESTART IDENTITY CASCADE;

-- 1. Авиакомпании
INSERT INTO Airlines (name, iata_code, logo_url) VALUES
('Аэрофлот', 'SU', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/airflot_logo.png'),
('S7 Airlines', 'S7', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/s7_logo.png'),
('Победа', 'DP', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/pobeda_logoo.png'),
('Utair', 'UT', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/utair_logo.png'),
('Turkish Airlines', 'TK', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/Turkish%20Airlines.png'),
('Emirates', 'EK', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/emirates_logo.png');

-- 2. Модели самолетов (с JSON схемами)
INSERT INTO Aircraft_Models (model_name, capacity, seat_map) VALUES
('Boeing 737-800', 186, '{ "rows": 30, "letters": ["A", "B", "C", "D", "E", "F"], "aisleAfter": ["C"], "prices": {"A": 500, "F": 500}, "rowPrices": {"1": 1500} }'),
('Airbus A320neo', 186, '{ "rows": 30, "letters": ["A", "B", "C", "D", "E", "F"], "aisleAfter": ["C"], "prices": {"A": 450, "F": 450}, "rowPrices": {"1": 2000} }'),
('Sukhoi Superjet 100', 98, '{ "rows": 20, "letters": ["A", "C", "D", "E", "F"], "aisleAfter": ["C"], "prices": {"A": 300, "F": 300}, "rowPrices": {"1": 1000} }'),
('Boeing 777-300ER', 428, '{ "rows": 50, "letters": ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], "aisleAfter": ["C", "G"], "prices": {"A": 800, "K": 800}, "rowPrices": {"1": 5000} }'),
('Airbus A380', 853, '{ "rows": 80, "letters": ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], "aisleAfter": ["C", "G"], "prices": {"A": 1000, "K": 1000}, "rowPrices": {"1": 7000} }');

-- 3. Аэропорты (С ТАЙМЗОНАМИ)
INSERT INTO Airports (airport_name, city, country, iata_code, time_zone) VALUES
('Пулково', 'Санкт-Петербург', 'Россия', 'LED', 'Europe/Moscow'),
('Шереметьево', 'Москва', 'Россия', 'SVO', 'Europe/Moscow'),
('Домодедово', 'Москва', 'Россия', 'DME', 'Europe/Moscow'),
('Внуково', 'Москва', 'Россия', 'VKO', 'Europe/Moscow'),
('Кольцово', 'Екатеринбург', 'Россия', 'SVX', 'Asia/Yekaterinburg'),
('Аэропорт Сочи', 'Сочи', 'Россия', 'AER', 'Europe/Moscow'),
('Стамбул', 'Стамбул', 'Турция', 'IST', 'Europe/Istanbul'),
('Дубай', 'Дубай', 'ОАЭ', 'DXB', 'Asia/Dubai'),
('Шпаковское', 'Ставрополь', 'Россия', 'STW', 'Europe/Moscow');

-- 5. Самолеты (Флот)
INSERT INTO Aircrafts (airline_id, model_id, registration_number) VALUES
(1, 3, 'RA-89001'), (1, 3, 'RA-89002'), (1, 1, 'VP-BZA'), (1, 1, 'VP-BZC'),
(2, 2, 'VQ-BTH'), (2, 2, 'VQ-BTI'), (3, 1, 'VQ-BTC'), (3, 1, 'VQ-BTD'),
(4, 1, 'VQ-BJI'), (5, 4, 'TC-JJN'), (6, 5, 'A6-EOT');

-- 6. ГЕНЕРАЦИЯ РАСПИСАНИЯ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
DO $$
DECLARE
    dep_r RECORD;
    arr_r RECORD;
    airline_code VARCHAR;
    flight_num INT := 100;
    dep_time TIME;
    arr_time TIME;
    duration INTERVAL;
    offset_day INT;
    
    -- Переменные для проверки UTC
    dep_utc TIMESTAMP WITH TIME ZONE;
    arr_utc TIMESTAMP WITH TIME ZONE;
BEGIN
    FOR dep_r IN SELECT * FROM Airports LOOP
        FOR arr_r IN SELECT * FROM Airports LOOP
            
            IF dep_r.airport_id != arr_r.airport_id AND dep_r.city != arr_r.city THEN
                
                dep_time := make_time(floor(random() * 18 + 6)::int, floor(random() * 60)::int, 0);
                duration := make_interval(hours => floor(random() * 4 + 2)::int);
                arr_time := dep_time + duration;
                
                -- 1. Предварительный расчет offset по локальному времени (переход через полночь)
                IF arr_time < dep_time THEN
                    offset_day := 1;
                ELSE
                    offset_day := 0;
                END IF;

                -- 2. ВАЖНО: Проверяем валидность в UTC (чтобы не было ошибки триггера)
                -- Конвертируем в UTC, используя таймзоны аэропортов и текущую дату
                dep_utc := (CURRENT_DATE + dep_time) AT TIME ZONE dep_r.time_zone;
                arr_utc := (CURRENT_DATE + arr_time + (offset_day || ' days')::INTERVAL) AT TIME ZONE arr_r.time_zone;

                -- Если из-за разницы часовых поясов мы "прилетели в прошлое" (или в то же время),
                -- добавляем еще один день к смещению.
                IF arr_utc <= dep_utc THEN
                    offset_day := offset_day + 1;
                END IF;

                SELECT iata_code INTO airline_code FROM Airlines ORDER BY RANDOM() LIMIT 1;

                INSERT INTO Schedules (
                    flight_number, departure_airport_id, arrival_airport_id, 
                    departure_time, arrival_time, arrival_day_offset, days_of_week
                ) VALUES (
                    airline_code || '-' || flight_num,
                    dep_r.airport_id,
                    arr_r.airport_id,
                    dep_time,
                    arr_time,
                    offset_day,
                    '{1,2,3,4,5,6,7}'
                );
                
                flight_num := flight_num + 1;
            END IF;
        END LOOP;
    END LOOP;
END $$;


-- 7. Тестовый пассажир
INSERT INTO Passengers (first_name, last_name, middle_name, document_number, birth_date, gender, document_type, document_series, user_id) VALUES
('Иван', 'Иванов', 'Иванович', '111111', '1990-05-20', 'male', 'passport_rf', '1111', NULL);

-- 8. Бронирование
INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number, booking_reference) 
VALUES (
    (SELECT flight_id FROM Flights ORDER BY RANDOM() LIMIT 1), 
    1, '12A', 'Confirmed', 'SU-QWERTY', 'PNR-001'
);