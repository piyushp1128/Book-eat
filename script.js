document.addEventListener('DOMContentLoaded', function () {
    let usersDatabase = {};

    // Fetch users.json
    fetch('users.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch users.json");
            }
            return response.json();
        })
        .then(data => {
            usersDatabase = data;
        })
        .catch(error => {
            console.error("Error loading user data:", error);
            alert("Failed to load login credentials. Please try again later.");
        });

    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('partnerGrn');

    // Toggle password visibility
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = passwordToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    const loginForm = document.getElementById('loginForm');

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // const grn = document.getElementById('grnInput').value.trim();
            // const partnerGrn = passwordInput.value.trim();

            // if (usersDatabase[grn] && usersDatabase[grn] === partnerGrn) 
            //     {
            //     // Redirect on success
                window.location.href = 'choose-canteen.html';
            // } else {
            //     alert('Invalid GRN or Partner GRN. Please try again.');
            // }
        });
    }

    // Optional: Add focus styling
    const formControls = document.querySelectorAll('.form-control');

    formControls.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('input-focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('input-focused');
            }
        });
    });
});
