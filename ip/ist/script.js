async function measureInternetSpeed() {
    const fileUrl = "https://ivanwebstudio.site/assets/img/works/sphere_nature_elements/LED_Sphere_2.mp4"; // Ссылка на тестовый файл
    const fileSizeInBytes = 10 * 1024 * 1024; // Размер файла в байтах (10 MB)

    const startTime = Date.now();
    const speedElement = document.getElementById("speed");
    const progressCircle = document.querySelector(".progress-circle");

    try {
        const response = await fetch(fileUrl, { method: "GET"});
        // const response = await fetch(fileUrl, { method: "GET", mode: "no-cors" });
        if (!response.ok) throw new Error("Ошибка при загрузке файла");

        const reader = response.body.getReader();
        let receivedBytes = 0;

        // Читаем поток данных
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            receivedBytes += value.length;
        }

        const endTime = Date.now();
        const durationInSeconds = (endTime - startTime) / 1000;

        // Рассчитываем скорость
        const speedInMbps = (fileSizeInBytes * 8) / (durationInSeconds * 1024 * 1024);
        speedElement.textContent = speedInMbps.toFixed(2);

        // Обновляем спидометр
        const maxSpeed = 300; // Максимальная скорость: 300 Mbps
        const circumference = 283; // Длина окружности SVG круга
        const progress = Math.min((speedInMbps / maxSpeed) * circumference, circumference); // Ограничиваем прогресс максимумом
        progressCircle.style.strokeDashoffset = circumference - progress;
    } catch (error) {
        console.error("Ошибка измерения скорости:", error);
        speedElement.textContent = "Ошибка";
    }
}

// Добавляем обработчик на кнопку
document.getElementById("start-test").addEventListener("click", measureInternetSpeed);
