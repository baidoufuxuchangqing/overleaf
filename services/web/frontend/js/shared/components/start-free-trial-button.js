import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-bootstrap'
import PropTypes from 'prop-types'
import * as eventTracking from '../../infrastructure/event-tracking'

export default function StartFreeTrialButton({
  buttonStyle = 'info',
  children,
  classes = {},
  setStartedFreeTrial,
  source,
}) {
  const { t } = useTranslation()

  const handleClick = useCallback(
    event => {
      event.preventDefault()

      eventTracking.send('subscription-funnel', 'upgraded-free-trial', source)

      const plan = 'collaborator_free_trial_7_days'

      eventTracking.sendMB('subscription-start-trial', { source, plan })

      if (setStartedFreeTrial) {
        setStartedFreeTrial(true)
      }

      const params = new URLSearchParams({
        planCode: plan,
        ssp: 'true',
        itm_campaign: source,
      })

      window.open(`/user/subscription/new?${params}`)
    },
    [setStartedFreeTrial, source]
  )

  return (
    <Button
      bsStyle={buttonStyle}
      onClick={handleClick}
      className={classes.button}
    >
      {children || t('start_free_trial')}
    </Button>
  )
}
StartFreeTrialButton.propTypes = {
  buttonStyle: PropTypes.string,
  children: PropTypes.any,
  classes: PropTypes.shape({
    button: PropTypes.string.isRequired,
  }),
  setStartedFreeTrial: PropTypes.func,
  source: PropTypes.string.isRequired,
}
