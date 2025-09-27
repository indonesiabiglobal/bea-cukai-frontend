<template>
  <div>
    <div id="g_id_onload"
         data-client_id="770024429450-39l0kn3bst6jhlm0jpkmfq9na7qmk7nv.apps.googleusercontent.com"
         data-context="signin"
         data-callback="handleCredentialResponse"
         data-auto_prompt="false">
    </div>

    <div class="g_id_signin"
         data-type="standard"
         data-shape="rectangular"
         data-theme="outline"
         data-text="signin_with"
         data-size="large"
         data-logo_alignment="left">
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    handleCredentialResponse(response) {
      console.log('Encoded JWT ID token: ' + response.credential);

      // Kirim ID token ke backend Laravel untuk diproses lebih lanjut
      axios.post('http://localhost:8000/api/auth/google/callback', {
        credential: response.credential
      })
      .then(response => {
        // Simpan token Passport yang dihasilkan di localStorage
        localStorage.setItem('token', response.data.token);

        // Redirect ke halaman yang diinginkan
        this.$router.push('/modules/products');
      })
      .catch(error => {
        console.error('Error during Google login:', error);
      });
    },
    loadGoogleScript() {
      // Tambahkan script Google Identity Services secara dinamis
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Google script');
      };
      document.head.appendChild(script);
    }
  },
  mounted() {
    // Set metode handleCredentialResponse agar bisa diakses global oleh Google
    window.handleCredentialResponse = this.handleCredentialResponse;

    // Muat script Google Identity Services saat komponen di-mount
    this.loadGoogleScript();
  }
}
</script>

<style>
.google-button {
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    color: red;
}

.google-button .icon img {
    width: 20px;
    height: 20px;
}

</style>
