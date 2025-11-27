INSERT INTO Airlines (name, iata_code) VALUES
('Аэрофлот', 'SU'),        -- ID 1
('S7 Airlines', 'S7'),     -- ID 2
('Победа', 'DP'),          -- ID 3
('Utair', 'UT'),           -- ID 4
('Turkish Airlines', 'TK'),-- ID 5
('Emirates', 'EK');         -- ID 6

-- Обновление логотипов
UPDATE airlines SET logo_url = 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/airflot_logo.png' WHERE iata_code = 'SU';
UPDATE airlines SET logo_url = 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/s7_logo.png' WHERE iata_code = 'S7';
UPDATE airlines SET logo_url = 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/pobeda_logoo.png' WHERE iata_code = 'DP';
UPDATE airlines SET logo_url = 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/utair_logo.png' WHERE iata_code = 'UT';
UPDATE airlines SET logo_url = 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/Turkish%20Airlines.png' WHERE iata_code = 'TK';
UPDATE airlines SET logo_url = 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/emirates_logo.png' WHERE iata_code = 'EK';

INSERT INTO Aircraft_Models (model_name, capacity) VALUES
('Boeing 737-800', 189),
('Airbus A320neo', 186),
('Sukhoi Superjet 100', 98),
('Boeing 777-300ER', 428),
('Airbus A380', 853);

INSERT INTO Airports (airport_name, city, country, iata_code) VALUES
('Пулково', 'Санкт-Петербург', 'Россия', 'LED'),        -- ID 1
('Шереметьево', 'Москва', 'Россия', 'SVO'),           -- ID 2
('Домодедово', 'Москва', 'Россия', 'DME'),           -- ID 3
('Внуково', 'Москва', 'Россия', 'VKO'),              -- ID 4
('Кольцово', 'Екатеринбург', 'Россия', 'SVX'),         -- ID 5
('Аэропорт Сочи', 'Сочи', 'Россия', 'AER'),             -- ID 6
('Стамбул', 'Стамбул', 'Турция', 'IST'),             -- ID 7
('Дубай', 'Дубай', 'ОАЭ', 'DXB'),                    -- ID 8
('Шпаковское', 'Ставрополь', 'Россия', 'STW');        -- ID 9

INSERT INTO Users (email, password_hash, role) VALUES
('client@example.com', '$2b$10$zqgfLRPJjOf4jbiy2SWMCOQmQQ3oU4xlyyHR245kqQTXu/UeKVK6G', 'client'),
('agent@example.com', '$2b$10$CjhwQ7bHsHO6n.FPB7.lo.sxZV81JcKVss3GLnhpD0n2yabUiGnZm', 'agent'),
('admin@example.com', '$2b$10$ohmlqLjjUkYGqPCGeyUlkegGfDrlKoJStGUytbeWOGrP3haMYqqTi', 'admin');


-- Шаг 2: Заполнение зависимых таблиц (Самолеты)

INSERT INTO Aircrafts (airline_id, model_id, registration_number) VALUES
(1, 3, 'RA-89001'), (1, 3, 'RA-89002'), -- Аэрофлот, 2xSSJ100
(1, 1, 'VP-BZA'),   (1, 1, 'VP-BZC'),   -- Аэрофлот, 2xB738
(2, 2, 'VQ-BTH'),   (2, 2, 'VQ-BTI'),   -- S7, 2xA320neo
(3, 1, 'VQ-BTC'),   (3, 1, 'VQ-BTD'),   -- Победа, 2xB738
(4, 1, 'VQ-BJI'),                       -- Utair, B738
(5, 4, 'TC-JJN'),                       -- Turkish, B777
(6, 5, 'A6-EOT');                       -- Emirates, A380

-- Шаг 3: Расписания рейсов (Триггер сработает автоматически)

INSERT INTO Schedules (flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, days_of_week) VALUES
('SU-001', 1, 2, '10:30:00', '12:00:00', '{1,2,3,4,5,6,7}'), -- LED -> SVO
('SU-002', 2, 1, '14:00:00', '15:35:00', '{1,2,3,4,5,6,7}'), -- SVO -> LED
('DP-212', 1, 4, '08:40:00', '10:15:00', '{1,2,3,4,5}'),     -- LED -> VKO
('S7-100', 2, 6, '09:15:00', '13:00:00', '{1,3,5,7}'),       -- SVO -> AER
('UT-350', 4, 5, '18:00:00', '22:30:00', '{2,4,6}'),         -- VKO -> SVX
('TK-401', 7, 2, '15:00:00', '19:45:00', '{1,2,3,4,5,6,7}'), -- IST -> SVO
('EK-131', 2, 8, '22:00:00', '04:30:00', '{1,4}'),          -- SVO -> DXB
('DP-6941', 1, 9, '11:00:00', '14:20:00', '{2,4,6}');       -- LED -> STW


-- Шаг 4: Пассажиры (Обновлено под новую структуру с document_type, birth_date и т.д.)

INSERT INTO Passengers (first_name, last_name, middle_name, document_number, birth_date, gender, document_type, document_series, user_id) VALUES
('Иван', 'Иванов', 'Иванович', '111111', '1990-05-20', 'Male', 'Passport', '1111', 1),
('Петр', 'Петров', 'Петрович', '222222', '1985-11-10', 'Male', 'Passport', '2222', NULL),
('Мария', 'Сидорова', 'Андреевна', '333333', '1992-03-15', 'Female', 'Passport', '3333', NULL),
('Елена', 'Кузнецова', NULL, '444444', '1988-07-30', 'Female', 'Passport', '4444', NULL),
('Александр', 'Смирнов', 'Викторович', '555555', '1975-01-05', 'Male', 'Passport', '5555', NULL),
('Ольга', 'Васильева', 'Сергеевна', '666666', '1995-09-12', 'Female', 'Passport', '6666', NULL),
('Дмитрий', 'Михайлов', 'Алексеевич', '777777', '1982-12-25', 'Male', 'Passport', '7777', NULL);


-- Шаг 5: Бронирования (Используем подзапросы для поиска flight_id, так как они генерируются триггером)

-- Иванов на ближайший рейс SU-001 (schedule_id = 1)
INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 1 ORDER BY departure_datetime LIMIT 1), 
    1, '12A', 'Confirmed', 'SU-QWERTY'
);

-- Петров на ближайший рейс S7-100 (schedule_id = 4)
INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 4 ORDER BY departure_datetime LIMIT 1), 
    2, '24C', 'Confirmed', 'S7-ASDFGH'
);

-- Сидорова на тот же рейс S7-100
INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 4 ORDER BY departure_datetime LIMIT 1), 
    3, '24B', 'Confirmed', 'S7-ZXCVBN'
);

-- Кузнецова на ближайший рейс DP-6941 (schedule_id = 8)
INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 8 ORDER BY departure_datetime LIMIT 1), 
    4, '15F', 'Confirmed', 'DP-STAVROP'
);