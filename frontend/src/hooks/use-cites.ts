import { useState, useEffect } from 'react';

export function useCities() {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/airports/cities');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        // В реальном приложении здесь была бы обработка ошибо
        // TODO: подумать о оброботке ошибок
      } finally {
        setIsLoading(false);
      }
    };
    fetchCities();
  }, []); 

  return { cities, isLoading };
}