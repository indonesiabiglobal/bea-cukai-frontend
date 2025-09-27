<script setup lang="ts">
import type {
  LandingNavItem,
  LandingFooterColumn,
  LandingSocialItem,
} from '/@src/components/layouts/landing/landing.types'
import config from '/@src/config.ts'

const { locale, t } = useI18n()
const panels = usePanels()
const route = useRoute()
const useApi = useApiFetchV2()

const useAddress = useAddressStore()
const whatsappNumber = ref(ref(useAddress.getAddress ? useAddress.getAddress.whatsappNumber : config.whatsappNumber))
const email = ref(useAddress.getAddress ? useAddress.getAddress.email1 : config.supportEmail)
const EmergencyNumber = ref(useAddress.getAddress ? useAddress.getAddress.emergencyNumber : config.emergencyNumber)
const whatsappMessage = encodeURIComponent('Halo saya ingin menjadwalkan appointment ...')
const whatsappLink = `https://wa.me/${whatsappNumber.value}?text=${whatsappMessage}`

const links = ref<LandingNavItem[]>([
  {
    label: {
      en: 'About',
      id: 'Tentang',
    },
    to: '/about',
  },
  {
    label: {
      en: 'Specialists',
      id: 'Spesialis',
    },
    to: '/specialists',
  },
  {
    label: {
      en: 'Packages',
      id: 'Paket',
    },
    to: '/packages',
  },
  {
    label: {
      en: 'Facilities',
      id: 'Fasilitas',
    },
    to: '/facilities',
  },
  {
    label: {
      en: 'Contact',
      id: 'Kontak',
    },
    to: '/contact',
  },
])

watchEffect(() => {
  links.value.forEach((link) => {
    link.active = link.to === route.path
  })
})

const footer = ref<LandingFooterColumn[]>([
  {
    label: {
      en: 'Discover',
      id: 'Jelajahi',
    },
    children: [
      {
        label: {
          en: 'About',
          id: 'Tentang',
        },
        to: '/about',
      },
      {
        label: {
          en: 'Specialists',
          id: 'Spesialis',
        },
        to: '/specialists',
      },
      {
        label: {
          en: 'Facilities',
          id: 'Fasilitas',
        },
        to: '/facilities',
      },
      {
        label: {
          en: 'Packages',
          id: 'Paket',
        },
        to: '/packages',
      },
      {
        label: {
          en: 'Contact',
          id: 'Kontak',
        },
        to: '/contact',
      },
      {
        label: {
          en: 'Career',
          id: 'Karir',
        },
        to: '/career',
      },
    ],
  },
])

const social = ref<LandingSocialItem[]>([
  {
    name: 'Instagram',
    icon: 'fa6-brands:instagram',
    link: 'https://www.instagram.com/',
  },
  {
    name: 'Youtube',
    icon: 'fa6-brands:youtube',
    link: 'https://www.youtube.com/',
  },
  {
    name: 'Tiktok',
    icon: 'fa6-brands:tiktok',
    link: 'https://www.tiktok.com/',
  },
  {
    name: 'LinkedIn',
    icon: 'fa6-brands:linkedin-in',
    link: 'https://www.linkedin.com/',
  },
  {
    name: 'Facebook',
    icon: 'fa6-brands:facebook-f',
    link: 'https://www.facebook.com/',
  },
  {
    name: 'Email',
    icon: 'fa6-solid:envelope',
    link: `mailto:${email.value}`,
  },
])

/**
 * Social Media
 */
const socialMedias = ref<LandingSocialItem[]>([])
const fetchsocialMedias = async () => {
  await useApi.get('social-medias', {}, false).then((res: any) => {
    socialMedias.value = res.result
  }).catch((err: any) => {
    console.log(err)
  })
}

onMounted(() => {
  fetchsocialMedias()
})
</script>

<template>
  <LandingLayout :links>
    <template #logo>
      <VLink to="/#" class="navbar-item">
        <div class="brand-icon">
          <AnimatedLogo width="34px" height="34px" />
        </div>
      </VLink>
    </template>

    <template #nav-end>
      <!-- <div class="navbar-item">
        <VDarkmodeSwitch />
      </div> -->
      <div class="navbar-item me-3">
        <ToolbarLanguage class="me-2" />
        <VButton
          href="/patients"
          color="primary"
          rounded
          raised
        >
          <strong>{{ t('make.appointment') }}</strong>
        </VButton>
      </div>
    </template>

    <slot />

    <LandingFooter :social="socialMedias" :links="footer">
      <div class="p-b-10">
        <AnimatedLogo width="36px" height="36px" />

        <!-- <div class="footer-description p-t-10 p-b-10">
          Vuero is built for developers and designers. It's modular approach lets you
          create awesome navbars with incredible layouts and elements.
        </div> -->
        <div class="footer-description" />
      </div>

      <template #action>
        <VButton
          href="http://go.cssninja.io/buy-vuero"
          color="primary"
          rounded
          raised
        >
          Buy <strong>Vuero</strong> on Themeforest
        </VButton>
        <VLink to="https://go.cssninja.io/discord" class="has-text-primary is-flex is-align-items-center ml-5">
          <span>Join us on Discord</span>
          <VIcon class="ml-1" icon="lucide:external-link" />
        </VLink>
      </template>

      <template #copyright>
        &copy; {{ new Date().getFullYear() }} <br>
        Designed and coded with
        <VIcon icon="fas fa-heart" class="has-text-danger" /> by
        <VLink to="https://cssninja.io" class="has-text-primary">
          Gies Health.
        </VLink>
      </template>
    </LandingFooter>

    <template #extra>
      <PanelLanguages />
    </template>
  </LandingLayout>
</template>

<style scoped lang="scss">
// @import '/@src/scss/custom/application';
</style>
