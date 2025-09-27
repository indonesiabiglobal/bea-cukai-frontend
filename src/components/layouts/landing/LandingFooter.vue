<script setup lang="ts">
import type { LandingFooterColumn, LandingSocialItem } from './landing.types'
import config from '/@src/config.ts'
const { locale, t } = useI18n()
type Locale = 'en' | 'id'
const props = defineProps<{
  title?: string
  subtitle?: string

  links?: LandingFooterColumn[]
  social?: LandingSocialItem[]
}>()
const useAddress = useAddressStore()

const whatsappMessage = encodeURIComponent('Halo saya ingin menjadwalkan appointment ...')
const whatsappNumber = ref(useAddress.getAddress ? useAddress.getAddress.whatsappNumber : config.whatsappNumber)
const EmergencyNumber = ref(useAddress.getAddress ? useAddress.getAddress.emergencyNumber : config.emergencyNumber)
const EmergencyLink = `https://wa.me/${EmergencyNumber.value}`
const whatsappLink = `https://wa.me/${whatsappNumber.value}?text=${whatsappMessage}`
const customerCare = ref(useAddress.getAddress ? useAddress.getAddress.customer_care : config.customerCareNumber)
const emergencyCallNumber = ref(useAddress.getAddress ? useAddress.getAddress.emergency_call : config.emergencyCallNumber)

// <!-- Start of Qontak Webchat Script -->
const qchatInit = document.createElement('script')
qchatInit.src = 'https://webchat.qontak.com/qchatInitialize.js'
const qchatWidget = document.createElement('script')
qchatWidget.src = 'https://webchat.qontak.com/js/app.js'
document.head.prepend(qchatInit)
document.head.prepend(qchatWidget)
qchatInit.onload = function () {
  qchatInitialize({
    id: '373f9006-128a-443d-9d7c-fe9a7c581a66',
    code: 'ryC5Nc_jV7GVwHrgMvBgnA',
  })
}
// <!-- End of Qontak Webchat Script -->
</script>

<script>
</script>

<template>
  <footer class="vuero-footer is-relative pt-0">
    <!-- Landing Contact -->
    <LandingContact />
    <div class="whatsapp-wrapper">
      <a :href="EmergencyLink" class="theme-btn btn-style-one emergency-call">Emergency Call</a>
      <a :href="whatsappLink">
        <img src="/images/social/whatsapp.png" alt="whatsapp">
      </a>
    </div>
    <div class="auto-container">
      <div v-if="'default' in $slots || props.social?.length || props.links?.length" class="columns footer-body justify-content-around">
        <!-- Column -->
        <div v-if="'default' in $slots || props.social?.length" class="column is-3">
          <slot />
          <!-- <div v-if="props.social">
            <div class="social-links p-b-10">
              <VLink
                v-for="item in social"
                :key="item.icon"
                :to="item.link"
              >
                <VIcon :icon="item.icon" class="icon" />
              </VLink>
            </div>
          </div> -->
        </div>
        <!-- Column -->
        <div
          class="column"
          :class="'default' in $slots || props.social?.length ? 'is-9' : 'is-12 has-text-centered'"
        >
          <div class="row">
            <!-- Column -->
            <div
              v-for="column in props.links"
              :key="column.label[locale as Locale]"
              class="col-lg-3 col-md-6 col-sm-6 col-6"
            >
              <ul class="footer-column ms-5">
                <li class="column-header">
                  {{ column.label[locale as Locale] }}
                </li>
                <li
                  v-for="link in column.children"
                  :key="link.label[locale as Locale]"
                  class="column-item"
                >
                  <VLink :to="link.to">
                    {{ link.label[locale as Locale] }}
                  </VLink>
                </li>
              </ul>
            </div>

            <!-- BUSINESS HOURS -->
            <div class="col-lg-3 col-md-6 col-sm-6 col-6">
              <ul class="footer-column">
                <li class="column-header">
                  {{ t('footer.bussiness-hours') }}
                </li>
                <li
                  class="column-item"
                >
                  {{ t('footer.bussiness-hours.weekdays') }}
                </li>
                <li class="column-item">
                  <span class="column-item-time">9:00am to 5:00pm</span>
                </li>
                <li class="column-item">
                  {{ t('footer.bussiness-hours.saturdays') }}
                </li>
                <li class="column-item">
                  <span class="column-item-time">9:00am to 1:00pm</span>
                </li>
              </ul>
            </div>

            <!-- CONTACT US -->
            <div class="col-lg-3 col-md-6 col-sm-6 col-6">
              <ul class="footer-column">
                <li class="column-header">
                  {{ t('footer.contact-us') }}
                </li>
                <li class="column-item">
                  {{ t('footer.customer-care') }}
                </li>
                <li class="column-item">
                  <span class="column-item-time"><a :href="`tel:${customerCare}`">{{ customerCare }}</a></span>
                </li>
                <li class="column-item">
                  {{ t('footer.emergency-call') }}
                </li>
                <li class="column-item">
                  <span class="column-item-time"><a :href="`tel:${emergencyCallNumber}`">{{ emergencyCallNumber }}</a></span>
                </li>
              </ul>
            </div>

            <!-- Social Media -->
            <div class="col-lg-3 col-md-6 col-sm-6 col-6">
              <ul class="footer-column">
                <li class="column-header">
                  {{ t('footer.social-media') }}
                </li>
                <li
                  v-for="item in props.social"
                  :key="item.name"
                  class="column-item"
                >
                  <!-- email -->
                  <a
                    v-if="item.name === 'Email'"
                    :href="`mailto:${item.link}`"
                    class="group flex flex-row items-center gap-x-2 transition-all duration-200 hover:brightness-125"
                  >
                    <VIcon :icon="item.icon" class="text-orange" />
                    {{ item.name }}
                  </a>
                  <a
                    v-else
                    :href="item.link"
                    target="_blank"
                    class="group flex flex-row items-center gap-x-2 transition-all duration-200 hover:brightness-125"
                  >
                    <VIcon :icon="item.icon" class="text-orange" />
                    {{ item.name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-copyright has-text-centered">
        <slot name="copyright" />
      </div>
    </div>
  </footer>
  <!-- /Simple light footer -->
</template>

<style scoped lang="scss">
// @import '/@src/scss/custom/application';
</style>

<style lang="scss">
.landing-page .container {
  max-width: 1310px !important;
}
.footer-column .column-item-time {
  font-family: 'Helvetica-Bold';
  font-weight: 700 !important;
}
.vuero-footer {
  padding-bottom: 0 !important;
  padding-top: 4rem !important;
  background: var(--body-color);
  font-family: 'Helvetica', sans-serif;

  .footer-head {
    padding-bottom: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid color-mix(in oklab, var(--fade-grey), black 4%);

    .head-text {
      h3 {
        font-family: var(--font);
        font-size: 1.8rem;
        color: var(--dark-text);
      }

      p {
        font-size: 1.1rem;
        color: var(--light-text);
      }
    }

    .head-action {
      .buttons {
        .button {
          &.action-button {
            height: 36px;
            min-width: 140px;
          }

          &.chat-button {
            background: transparent;
            border: none;
            box-shadow: none;
            color: var(--primary);
            font-weight: 500;
          }
        }
      }
    }
  }

  .footer-body {
    padding-top: 3rem;

    .footer-column {
      padding-top: 20px;

      .column-header {
        font-family: var(--font-bold);
        text-transform: uppercase;
        color: var(--dark-text);
        font-size: 1.4rem;
        font-weight: 700;
        margin: 10px 0;
      }

      .column-item {
        padding-bottom: 10px;

        a {
          font-family: var(--font);
          color: var(--light-text);

          &:hover,
          &:focus {
            color: var(--primary);
          }
        }
      }
    }

    .social-links {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .icon {
        color: var(--light-text);
        font-size: 16px;
        margin-inline-end: 0.6rem;

        &:hover,
        &:focus {
          color: var(--primary);
        }
      }
    }

    .footer-description {
      color: var(--light-text);
    }

    .small-footer-logo {
      height: 36px;
    }
  }

  .footer-copyright {
    font-family: var(--font);
    color: var(--light-text);
    padding: 4rem 0 2rem;

    a {
      color: var(--light-text);

      &:hover,
      &:focus {
        color: var(--primary);
      }
    }
  }
}

.is-dark {
  .landing-page-wrapper {
    .vuero-footer {
      background: color-mix(in oklab, var(--landing-xxx), white 8%);

      .footer-head {
        border-color: color-mix(in oklab, var(--landing-xxx), white 18%);

        .head-text {
          h3 {
            color: var(--dark-dark-text);
          }

          p {
            font-size: 1.1rem;
            color: var(--light-text);
          }
        }

        .head-action {
          .buttons {
            .button {
              &.action-button {
                background: var(--primary);
                border-color: var(--primary);
              }

              &.chat-button {
                color: var(--primary);
                background: none !important;
              }
            }
          }
        }
      }

      .footer-body {
        .footer-column {
          .column-header {
            color: var(--dark-dark-text);
          }

          .column-item {
            a:hover {
              color: var(--primary);
            }
          }
        }

        .social-links {
          a:hover {
            color: var(--primary);
          }
        }
      }

      .footer-copyright {
        a {
          &:hover {
            color: var(--primary);
          }
        }
      }
    }
  }
}

@media (width <= 767px) {
  .vuero-footer {
    .footer-head {
      flex-direction: column;
      text-align: center;

      .head-text {
        padding-bottom: 20px;
      }
    }

    .footer-body {
      padding-inline-start: 20px;
      padding-inline-end: 20px;
    }
  }
}

@media only screen and (width >= 768px) and (width <= 1024px) and (orientation: portrait) {
  .vuero-footer {
    .footer-head,
    .footer-body {
      padding-inline-start: 20px;
      padding-inline-end: 20px;
    }

    .footer-description {
      max-width: 400px;
    }
  }
}

@media only screen and (width >= 768px) and (width <= 1024px) and (orientation: landscape) {
  .vuero-footer {
    .footer-head,
    .footer-body {
      padding-inline-start: 20px;
      padding-inline-end: 20px;
    }
  }
}
</style>
