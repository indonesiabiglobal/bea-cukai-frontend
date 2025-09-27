<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import config from '/@src/config.ts';

const router = useRouter()
const notyf = useNotyf()

const isLoading = ref(false)
const { t } = useI18n()
const useApi = useApiFetchV2()

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
  .object({
    full_name: z
      .string({
        required_error: 'Full name is required',
      })
      .min(1, 'Full name is required'),
    nik: z
      .string({
        required_error: 'NIK is required',
      })
      .min(16, 'NIK is minimum 16 characters')
      .max(16, 'NIK is maximum 16 characters'),
    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .min(1, 'Phone number is required'),
    email: z
      .string({
        required_error: t('auth.errors.email.required'),
      })
      .email(t('auth.errors.email.format')),
    password: z
      .string({
        required_error: t('auth.errors.password.required'),
      })
      .min(8, t('auth.errors.password.length')),
    password_confirmation: z.string({
      required_error: t('auth.errors.passwordCheck.required'),
    }),
    promotional: z.boolean(),
  })
  // Refine is used to add custom validation rules to the schema
  .refine(data => data.password === data.password_confirmation, {
    message: t('auth.errors.passwordCheck.match'),
    path: ['passwordCheck'],
  })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

// Define a validation schema
const validationSchema = toTypedSchema(zodSchema)

// Set initial values for the form
const initialValues = {
  full_name: '',
  nik: '',
  phone: '',
  email: '',
  password: '',
  password_confirmation: '',
  promotional: false,
} satisfies FormInput

// here we create a vee-validate form context that
// will be used in all vuero form components
const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
})

const onSignup = handleSubmit(async (values) => {
  isLoading.value = true
  await useApi.post('/auth/patients/register', values).then(async (response) => {
    router.push('/auth/patients')
  }).catch((error) => {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }).finally(() => {
    isLoading.value = false
  })
})

useHead({
  title: config.site_title + ' - Sign Up Patient',
})
</script>

<template>
  <div class="auth-wrapper-inner is-single">
    <LandingGrids class="is-contrasted" />
    <!-- Form section -->
    <div class="hero is-fullheight">
      <div class="hero-heading">
        <div class="flex justify-center">
          <RouterLink to="/">
            <AnimatedLogo class="max-h-[48px]" width="100%" height="100%" />
          </RouterLink>
        </div>
      </div>
      <div class="hero-body">
        <div class="container">
          <div class="columns">
            <div class="column is-12">
              <div class="auth-content justify-items-center">
                <h2>{{ t('auth.title') }}</h2>
                <p>{{ t('auth.subtitle') }}</p>
                <RouterLink to="/auth/patients" class="auth-link">
                  {{ t('auth.action.login') }}
                </RouterLink>
              </div>
              <div class="auth-form-wrapper form-card">
                <!-- Login Form -->
                <form method="post" novalidate @submit="onSignup">
                  <div class="login-form">
                    <!-- Full Name -->
                    <VField id="full_name" v-slot="{ field }">
                      <VControl icon="lucide:user">
                        <VInput type="text" placeholder="Full Name" autocomplete="full_name" />
                        <p v-if="field?.errorMessage" class="help is-danger">
                          {{ field.errorMessage }}
                        </p>
                      </VControl>
                    </VField>

                    <!-- NIK -->
                    <VField id="nik" v-slot="{ field }">
                      <VControl icon="lucide:credit-card">
                        <VInput type="text" placeholder="NIK" autocomplete="nik" />
                        <p v-if="field?.errorMessage" class="help is-danger">
                          {{ field.errorMessage }}
                        </p>
                      </VControl>
                    </VField>

                    <!-- Phone -->
                    <VField id="phone" v-slot="{ field }">
                      <VControl icon="lucide:phone">
                        <VInput type="text" placeholder="Phone" autocomplete="phone" />
                        <p v-if="field?.errorMessage" class="help is-danger">
                          {{ field.errorMessage }}
                        </p>
                      </VControl>
                    </VField>

                    <!-- Input -->
                    <VField id="email" v-slot="{ field }">
                      <VControl icon="lucide:mail">
                        <VInput type="text" :placeholder="t('auth.placeholder.email')" autocomplete="email" />
                        <p v-if="field?.errorMessage" class="help is-danger">
                          {{ field.errorMessage }}
                        </p>
                      </VControl>
                    </VField>

                    <!-- Input -->
                    <VField id="password" v-slot="{ field }">
                      <VControl icon="lucide:lock">
                        <VInput type="password" :placeholder="t('auth.placeholder.password')"
                          autocomplete="new-password" />
                        <p v-if="field?.errorMessage" class="help is-danger">
                          {{ field.errorMessage }}
                        </p>
                      </VControl>
                    </VField>

                    <!-- Input -->
                    <VField id="password_confirmation" v-slot="{ field }">
                      <VControl icon="lucide:lock">
                        <VInput type="password" :placeholder="t('auth.placeholder.passwordCheck')" />
                        <p v-if="field?.errorMessage" class="help is-danger">
                          {{ field.errorMessage }}
                        </p>
                      </VControl>
                    </VField>

                    <VField id="promotional" v-slot="{ field }">
                      <VControl class="setting-item">
                        <VCheckbox color="primary" :label="t('auth.label.promotional')" paddingless />
                      </VControl>
                    </VField>

                    <!-- Submit -->

                    <div class="login">
                      <VButton type="submit" color="primary" bold fullwidth raised :loading="isLoading">
                        {{ t('auth.action.signup') }}
                      </VButton>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-link {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.auth-wrapper-inner .hero .hero-body {
  .auth-content {
    margin-top: 0px;
  }
  .auth-form-wrapper {
    max-width: 500px;
  }
}

.form-card {
  background: var(--white);
  border: 1px solid color-mix(in oklab, var(--fade-grey), black 3%);
  border-radius: 10px;
  padding: 48px;
}
</style>