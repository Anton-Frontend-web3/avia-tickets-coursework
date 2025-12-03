INSERT INTO Airlines (name, iata_code, logo_url) VALUES
('Аэрофлот', 'SU', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/airflot_logo.png'),
('S7 Airlines', 'S7', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/s7_logo.png'),
('Победа', 'DP', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/pobeda_logoo.png'),
('Utair', 'UT', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/utair_logo.png'),
('Turkish Airlines', 'TK', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/Turkish%20Airlines.png'),
('Emirates', 'EK', 'https://raw.githubusercontent.com/Anton-Frontend-web3/AssetsImage/main/emirates_logo.png');

-- Вставляем сразу с seat_map (JSON)
INSERT INTO Aircraft_Models (model_name, capacity, seat_map) VALUES
('Boeing 737-800', 189, '{ "rows": 30, "letters": ["A", "B", "C", "D", "E", "F"], "aisleAfter": ["C"] }'),
('Airbus A320neo', 186, '{ "rows": 30, "letters": ["A", "B", "C", "D", "E", "F"], "aisleAfter": ["C"] }'),
('Sukhoi Superjet 100', 98, '{ "rows": 20, "letters": ["A", "C", "D", "E", "F"], "aisleAfter": ["C"] }'),
('Boeing 777-300ER', 428, '{ "rows": 50, "letters": ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], "aisleAfter": ["C", "G"] }'),
('Airbus A380', 853, '{ "rows": 80, "letters": ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], "aisleAfter": ["C", "G"] }');

INSERT INTO Airports (airport_name, city, country, iata_code) VALUES
('Пулково', 'Санкт-Петербург', 'Россия', 'LED'),
('Шереметьево', 'Москва', 'Россия', 'SVO'),
('Домодедово', 'Москва', 'Россия', 'DME'),
('Внуково', 'Москва', 'Россия', 'VKO'),
('Кольцово', 'Екатеринбург', 'Россия', 'SVX'),
('Аэропорт Сочи', 'Сочи', 'Россия', 'AER'),
('Стамбул', 'Стамбул', 'Турция', 'IST'),
('Дубай', 'Дубай', 'ОАЭ', 'DXB'),
('Шпаковское', 'Ставрополь', 'Россия', 'STW');

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
('SU-001', 1, 2, '10:30:00', '12:00:00', '{1,2,3,4,5,6,7}'),
('SU-002', 2, 1, '14:00:00', '15:35:00', '{1,2,3,4,5,6,7}'),
('DP-212', 1, 4, '08:40:00', '10:15:00', '{1,2,3,4,5}'),
('S7-100', 2, 6, '09:15:00', '13:00:00', '{1,3,5,7}'),
('UT-350', 4, 5, '18:00:00', '22:30:00', '{2,4,6}'),
('TK-401', 7, 2, '15:00:00', '19:45:00', '{1,2,3,4,5,6,7}'),
('EK-131', 2, 8, '22:00:00', '04:30:00', '{1,4}'),
('DP-6941', 1, 9, '11:00:00', '14:20:00', '{2,4,6}');

-- Шаг 4: Пассажиры

INSERT INTO Passengers (first_name, last_name, middle_name, document_number, birth_date, gender, document_type, document_series, user_id) VALUES
('Иван', 'Иванов', 'Иванович', '111111', '1990-05-20', 'male', 'passport_rf', '1111', 1),
('Петр', 'Петров', 'Петрович', '222222', '1985-11-10', 'male', 'passport_rf', '2222', NULL),
('Мария', 'Сидорова', 'Андреевна', '333333', '1992-03-15', 'female', 'passport_rf', '3333', NULL),
('Елена', 'Кузнецова', NULL, '444444', '1988-07-30', 'female', 'passport_rf', '4444', NULL);

-- Шаг 5: Бронирования

INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 1 ORDER BY departure_datetime LIMIT 1), 
    1, '12A', 'Confirmed', 'SU-QWERTY'
);

INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 4 ORDER BY departure_datetime LIMIT 1), 
    2, '24C', 'Confirmed', 'S7-ASDFGH'
);

INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 4 ORDER BY departure_datetime LIMIT 1), 
    3, '24B', 'Confirmed', 'S7-ZXCVBN'
);

INSERT INTO Bookings (flight_id, passenger_id, seat_number, status, ticket_number) 
VALUES (
    (SELECT flight_id FROM Flights WHERE schedule_id = 8 ORDER BY departure_datetime LIMIT 1), 
    4, '15F', 'Confirmed', 'DP-STAVROP'
);