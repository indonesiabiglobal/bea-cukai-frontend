/**
 * Resolve after `time` has been spend.
 *
 * @param time Time in milliseconds to wait
 */
type size = 'default' | 'large' | 'wide' | 'full'
export default function changeLayout(size: size) {
  const layoutSwitcher = useLayoutSwitcher()
  layoutSwitcher.setContentSize(size)
  onBeforeUnmount(() => {
    layoutSwitcher.setContentSize('wide')
  })
}
