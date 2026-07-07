// Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
}));

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach((element) => {
    observer.observe(element);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});


// Typewriter effect
const phrases = [
    "Exploring many stuff",
    "please give me an internship",
    "Redbull is better than coffee",
    "Running on redbull",
    "intern when?"
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterElement = document.querySelector('.typewriter');

function type() {
    if (!typewriterElement) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = 100 - Math.random() * 50; // Randomize typing speed for realism

    if (isDeleting) {
        typeSpeed /= 2; // Delete faster
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000; // Pause at end of phrase
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause before typing new phrase
    }

    setTimeout(type, typeSpeed);
}

if (typewriterElement) {
    setTimeout(type, 1000); // Initial delay
}

// Binary Divider Scroll Decode Effect
const binaryDivider = document.getElementById('binary-divider');
const binaryTrack = document.getElementById('binary-track');

if (binaryDivider && binaryTrack) {
    const baseBinary = "01101110 01100001 01101010 01101101 01101001 ";
    const baseTarget = "najmi ";

    // Ensure both strings are exactly the same length to prevent layout jumps
    const fullLength = 1000;
    const fullBinary = baseBinary.repeat(Math.ceil(fullLength / baseBinary.length)).substring(0, fullLength);
    const fullTarget = baseTarget.repeat(Math.ceil(fullLength / baseTarget.length)).substring(0, fullLength);

    // Pre-calculate thresholds for a center-outwards decode wave
    const thresholds = [];
    const center = fullLength / 2;
    for (let i = 0; i < fullLength; i++) {
        // Normalize distance from center to 0..1
        let dist = Math.abs(i - center) / center;
        // Add slight random noise to the threshold for a glitchy edge
        let noise = (Math.sin(i * 43.21) * 0.1);
        thresholds.push(Math.max(0, Math.min(1, dist + noise)));
    }

    // Initial state
    binaryTrack.textContent = fullBinary;

    window.addEventListener('scroll', () => {
        const rect = binaryDivider.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Starts decoding when the divider enters the bottom of the viewport
        // Fully decoded when it reaches 75% up the viewport
        let progress = (windowHeight - rect.top) / (windowHeight * 0.50);
        progress = Math.max(0, Math.min(1, progress));

        if (progress === 0) {
            binaryTrack.textContent = fullBinary;
            return;
        }

        if (progress === 1) {
            binaryTrack.textContent = fullTarget;
            return;
        }

        const symbols = "!@#$%^&*<>/?+-=";
        const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        let currentText = "";
        for (let i = 0; i < fullLength; i++) {
            if (progress > thresholds[i]) {
                currentText += fullTarget[i];
            } else {
                let diff = thresholds[i] - progress;
                if (fullTarget[i] === ' ') {
                    currentText += fullBinary[i];
                } else if (diff < 0.05) {
                    currentText += letters[Math.floor(Math.random() * letters.length)];
                } else if (diff < 0.10) {
                    currentText += symbols[Math.floor(Math.random() * symbols.length)];
                } else if (diff < 0.15) {
                    currentText += Math.floor(Math.random() * 10);
                } else if (diff < 0.20) {
                    currentText += Math.random() > 0.7 ? "1" : "0";
                } else {
                    currentText += fullBinary[i];
                }
            }
        }
        binaryTrack.textContent = currentText;
    });
}



// Ripple Effect
document.querySelectorAll('.ripple-btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple-span');
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Projects Scroll Animation
const projectListItems = document.querySelectorAll('.project-list-item');
const projectDetails = document.querySelectorAll('.project-detail');

if (projectListItems.length > 0) {
    const projectObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger when item crosses the middle of the viewport
        threshold: 0
    };

    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all items and details
                projectListItems.forEach(item => item.classList.remove('active'));
                projectDetails.forEach(detail => detail.classList.remove('active'));

                // Add active class to the current list item
                entry.target.classList.add('active');

                // Find corresponding project detail and add active class
                const targetId = entry.target.getAttribute('data-target');
                const targetDetail = document.getElementById(targetId);
                
                if (targetDetail) {
                    targetDetail.classList.add('active');
                }
            }
        });
    }, projectObserverOptions);

    projectListItems.forEach(item => {
        projectObserver.observe(item);
        
        // Allow clicking on the list item to smoothly scroll it into center view
        item.addEventListener('click', () => {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}
