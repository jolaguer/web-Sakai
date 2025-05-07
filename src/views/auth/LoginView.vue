<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
// No need to import SVG files
</script>

<template>
  <AppLayout>
    <template #content>
      <div class="login-container">
        <!-- Left section with login form -->
        <div class="login-form-section">
          <div class="login-content">
            <h1 class="welcome-heading">Welcome to BajajExpress Booking System!</h1>
            <p class="welcome-subtext">Easily book your Bajaj vehicle and manage your fleet with our efficient and user-friendly system. Get started now!</p>

            <div class="form-container">
              <LoginForm></LoginForm>
            </div>
          </div>
        </div>
        
        <!-- Right section with illustration and animated image -->
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
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.login-container {
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

.login-form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.login-content {
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

.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.3);
}

.divider-text {
  padding: 0 1rem;
  color: #f0f0f0;
  font-size: 0.9rem;
}

.social-auth-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-text {
  font-weight: 500;
  margin-left: 0.5rem;
}

.register-prompt {
  text-align: center;
  margin-top: 1.5rem;
  color: #f0f0f0;
}

.register-link {
  color: #fdbb2d;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.register-link:hover {
  color: #ffffff;
  text-decoration: underline;
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

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: absolute;
  bottom: 35%;
  right: 25%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon {
  background: linear-gradient(120deg, #fdbb2d, #b21f1f);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.feature-text {
  text-align: left;
}

.feature-text h3 {
  font-size: 1rem;
  margin: 0;
  color: #ffffff;
}

.feature-text p {
  color: #f0f0f0;
  margin: 0;
  font-size: 0.85rem;
}

.feature-percentage {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-left: 1rem;
}

.testimonial-avatars {
  display: flex;
  margin: 1.5rem 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  margin-left: -10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.avatar-1 {
  background: linear-gradient(45deg, #fdbb2d, #b21f1f);
  z-index: 3;
}

.avatar-2 {
  background: linear-gradient(45deg, #b21f1f, #1a2a6c);
  z-index: 2;
}

.avatar-3 {
  background: linear-gradient(45deg, #1a2a6c, #4b6cb7);
  z-index: 1;
}

.slider-dots {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
}

.dot.active {
  background: linear-gradient(90deg, #fdbb2d, #b21f1f);
  width: 24px;
  border-radius: 12px;
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

/* Responsive adjustments */
@media (max-width: 960px) {
  .login-container {
    flex-direction: column;
  }
  
  .illustration-section {
    display: none;
  }
  
  .login-form-section {
    padding: 3rem 1.5rem;
  }
}
</style>