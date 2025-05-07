<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import Registerform from '@/components/auth/Registerform.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <div class="register-container">
        <!-- Left section with illustration and animated image -->
        <div class="illustration-section">
          <div class="illustration-content">
            <div class="animated-image-container">
              <v-img src="/images/jeje.jpg" height="500" class="floating-image"></v-img>
              <div class="image-text-overlay">
                <p class="image-quote">"Drive with ease, book with Bajaj."</p>
              </div>
            </div>
            
            <div class="tagline-container">
              <h2 class="tagline">Streamline your bookings and vehicle management with <span class="app-name">BajajExpress</span></h2>
            </div>
          </div>
        </div>
        
        <!-- Right section with registration form -->
        <div class="register-form-section">
          <div class="register-content">
            <h1 class="welcome-heading">BajajExpress Booking System!</h1>
            <p class="welcome-subtext">Create your account to easily book Bajaj vehicles and manage your fleet with our efficient and user-friendly system.</p>

            <div class="form-container">
              <Registerform></Registerform>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(120deg, #1a2a6c, #b21f1f, #fdbb2d);
  background-size: 200% 200%;
  animation: gradientBG 15s ease infinite;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.illustration-section {
  flex: 1;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 2rem;
}

.illustration-content {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.animated-image-container {
  position: relative;
  width: 80%;
  max-width: 400px;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

.floating-image {
  border-radius: 12px;
}

.image-text-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  color: white;
  text-align: center;
}

.image-quote {
  font-style: italic;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.tagline-container {
  margin-top: 2rem;
}

.tagline {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.app-name {
  color: #fdbb2d;
  font-weight: 700;
  background: linear-gradient(90deg, #fdbb2d, #ff4e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.register-form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.register-content {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.welcome-heading {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.welcome-subtext {
  color: #f0f0f0;
  margin-bottom: 2rem;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.form-container {
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-prompt {
  text-align: center;
  margin-top: 1.5rem;
  color: #f0f0f0;
}

.login-link {
  color: #fdbb2d;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.login-link:hover {
  color: #ffffff;
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .register-container {
    flex-direction: column-reverse;
  }
  
  .illustration-section {
    display: none;
  }
  
  .register-form-section {
    padding: 3rem 1.5rem;
  }
}
</style>