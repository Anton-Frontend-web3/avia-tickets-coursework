export interface SeatMapConfig {
	rows: number
	letters: string[]
	aisleAfter: string[] // После каких букв идет проход

	// Новые поля для цен (ключ - буква или номер ряда, значение - цена в рублях)
	prices?: Record<string, number> // Например: { "A": 500 }
	rowPrices?: Record<string, number> // Например: { "1": 1500 }
}
