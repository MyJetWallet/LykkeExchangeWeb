import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {RootStoreProps} from '../../App';
import {ROUTE_WALLET} from '../../constants/routes';
import {STORE_ROOT} from '../../constants/stores';
import {TransferModel} from '../../models';
import {WalletStore} from '../../stores';
import FormGroup from '../FormGroup';
import FormInput from '../FormInput';
import {LoadableProps} from '../hoc/loadable';
import Select, {SelectOption} from '../Select';
import './style.css';

type InputEventHandler = React.FormEventHandler<HTMLInputElement>;
type SelectEventHandler = (e: SelectOption) => void;

interface TransferFormProps extends LoadableProps, RootStoreProps {
  transfer: TransferModel;
  walletStore: WalletStore;
  onTransfer?: (transfer: TransferModel) => any;
  onSucceeddedTransfer?: (transfer: TransferModel) => any;
  onFailedTransfer?: (transfer: TransferModel, reason: any) => any;
}

export const TransferForm: React.SFC<TransferFormProps> = ({
  transfer,
  walletStore,
  rootStore,
  onTransfer = () => null,
  onSucceeddedTransfer = () => null,
  onFailedTransfer = () => null
}) => {
  const handleChangeAmount: InputEventHandler = e => {
    transfer.update({
      amount: Number(e.currentTarget.value)
    });
  };

  const handleChangeWallet = (
    side: 'from' | 'to'
  ): SelectEventHandler => option => {
    transfer.update({
      [side]: option
    });
  };

  const handleChangeAsset = (option: any) =>
    transfer.update({asset: option.value});

  const handleSubmit: InputEventHandler = async e => {
    e.preventDefault();
    await transfer.submit();
    onTransfer(transfer);
  };

  return (
    <form className="transfer-form">
      <div className="transfer-form__body">
        <FormGroup label="Asset">
          <Select
            options={transfer.from.balances}
            valueKey="assetId"
            labelKey="assetId"
            onChange={handleChangeAsset}
            value={transfer.asset}
          />
        </FormGroup>
        <FormGroup label="From">
          <Select
            options={walletStore
              .getWalletsWithAssets()
              .map(w => ({value: w.id, label: w.title}))}
            onChange={handleChangeWallet('from')}
            value={transfer.from.id}
          />
        </FormGroup>
        <FormGroup label="To">
          <Select
            options={walletStore.getAllWalletsExceptOne(transfer.from)}
            valueKey="id"
            labelKey="title"
            onChange={handleChangeWallet('to')}
            value={transfer.to && transfer.to.id}
          />
        </FormGroup>
        <FormGroup label="Amount">
          <FormInput type="text" onChange={handleChangeAmount} />
        </FormGroup>
        <FormGroup label="">
          <div className="form__input">
            = {transfer.amountInBaseCurrency}{' '}
            {rootStore!.profileStore.baseCurrency}
          </div>
        </FormGroup>
      </div>
      <div className="transfer__actions">
        <div>
          <input type="submit" value="Submit" onClick={handleSubmit} />
        </div>
        <div>
          <Link to={ROUTE_WALLET}>Cancel and go back</Link>
        </div>
      </div>
    </form>
  );
};

export default inject(STORE_ROOT)(observer(TransferForm));
