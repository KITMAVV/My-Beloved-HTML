let count = 0;
let level = 0;
let lastClickTime = 0;
const maxLevel = 18;
const levelIncreaseThreshold = 0.5;
const levelDecreaseInterval = 2000;

document.getElementById('catButton').addEventListener('click', function () {
    const currentTime = Date.now();

    if (currentTime - lastClickTime <= levelIncreaseThreshold * 1000) {
        if (level < maxLevel) {
            level++;
        }
    }

    lastClickTime = currentTime;

    fetch('https://api.thecatapi.com/v1/images/search')
        .then(response => response.json())
        .then(data => {
            const catImage = document.getElementById('catImage');
            const counter = document.getElementById('counter');

            catImage.src = data[0].url;
            catImage.style.display = 'block';

            count++;
            counter.textContent = count;

            updateShakeIntensity(counter);

            setTimeout(decreaseLevel, levelDecreaseInterval);
        })
        .catch(error => console.error('Error fetching the cat image:', error));
});

function updateShakeIntensity(element) {
    if (level >= 18) {
        element.classList.add('shake-10');
        element.classList.remove('shake-5');
        element.classList.remove('shake');
    } else if (level >= 10) {
        element.classList.add('shake-5');
        element.classList.remove('shake-10');
        element.classList.remove('shake');
    } else if (level >= 5) {
        element.classList.add('shake');
        element.classList.remove('shake-10');
        element.classList.remove('shake-5');
    } else {
        element.classList.remove('shake-5', 'shake-10');
    }
}

function decreaseLevel() {
    const currentTime = Date.now();
    if (currentTime - lastClickTime >= levelDecreaseInterval && level > 0) {
        level--;
        updateShakeIntensity(document.getElementById('counter'));
        setTimeout(decreaseLevel, 3000);
    }
    if (level > 0) {
        setTimeout(decreaseLevel, 3000);
    } else {
        document.getElementById('counter').classList.remove('shake-5', 'shake-10', 'shake');
    }
}
