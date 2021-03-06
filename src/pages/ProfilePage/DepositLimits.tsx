import classnames from 'classnames';
import {inject, observer} from 'mobx-react';
import React from 'react';
import {RootStoreProps} from '../../App';
import {AnalyticsEvent} from '../../constants/analyticsEvents';
import {STORE_ROOT} from '../../constants/stores';

export const DepositLimits: React.SFC<RootStoreProps> = ({rootStore}) => {
  const analyticsService = rootStore!.analyticsService;
  const tierInfo = rootStore!.kycStore.tierInfo;
  if (!tierInfo) {
    return null;
  }
  const currentTier = tierInfo.CurrentTier;
  if (currentTier.MaxLimit === 0) {
    // do no render this component if max is 0
    return null;
  }
  const current = currentTier.Current;
  const max = currentTier.MaxLimit;
  const ratio = Math.min(current / max * 100, 100);

  let selectedGradient;
  if (current >= max) {
    selectedGradient = 'high';
  } else {
    selectedGradient = 'medium';
  }

  let handleAlignment = '';
  if (ratio <= 10) {
    handleAlignment = 'left';
  } else {
    handleAlignment = 'right';
  }

  const currentAsInteger = parseInt(`${current}`, 10);
  return (
    <div className="deposit-limits">
      <h2 className="deposit-limits__title">Deposit Limits</h2>
      <div className="deposit-limits-progress">
        <div
          className="deposit-limits-progress__bar"
          onClick={() => {
            analyticsService.track(
              AnalyticsEvent.ClickOnDepositLimitProgressBar
            );
          }}
        >
          <div
            className={classnames(
              'deposit-limits-progress__bar-fill',
              selectedGradient
            )}
            style={{width: `${ratio}%`}}
          >
            &nbsp;
            <span
              className={classnames(
                'deposit-limits-progress__bar-fill__handle',
                handleAlignment
              )}
            >
              {currentAsInteger} EUR
            </span>
          </div>
        </div>
        <div className="deposit-limits-legend">
          <span className="first">Last 30d</span>
          <span className="last">{max} EUR</span>
        </div>
      </div>
    </div>
  );
};

export default inject(STORE_ROOT)(observer(DepositLimits));
