import Snabbdom from 'snabbdom-pragma'
import { linkToParentOut, formatOutAmount, formatSat, formatHex, linkToAddr } from './util'

const layout = (vin, desc, body, { t, index, query={}, ...S }) =>
  <div class={{ vin: true, selected: !!query[`input:${index}`] }}>
    <div className="vin-header">
      <div className="vin-header-container">
        <span>{ desc }</span>
        <span className="amount">{ vin.prevout && formatOutAmount(vin.prevout, { t, ...S }) }</span>
      </div>
    </div>
    { body }
  </div>

const pegin = (vin, { isOpen, t, ...S }) => layout(
  vin
, linkToParentOut(vin, t`Output in parent chain`)
, isOpen && <div className="vin-body">
    <div>
      <div>{t`txid:vout`}</div>
      <div className="mono">{linkToParentOut(vin)}</div>
    </div>
  </div>
, { t, ...S }
)

const standard = (vin, { isOpen, t, ...S }) => layout(
  vin

, vin.is_coinbase
    ? t`Coinbase`
    : <a href={`tx/${vin.txid}?output:${vin.vout}`}>{`${vin.txid}:${vin.vout}`}</a>

, isOpen && <div className="vin-body">
    { vin.issuance && [

      <div className="vin-body-row">
        <div>{t`Issuance`}</div>
        <div>{vin.issuance.is_reissuance ? t`Reissuance` : t`New asset`}</div>
      </div>

    , vin.issuance.asset_entropy &&
        <div className="vin-body-row">
          <div>{t`Issuance entropy`}</div>
          <div className="mono">{vin.issuance.asset_entropy}</div>
        </div>

    , vin.issuance.asset_blinding_nonce &&
        <div className="vin-body-row">
          <div>{t`Issuance blinding nonce`}</div>
          <div className="mono">{vin.issuance.asset_blinding_nonce}</div>
        </div>

    , <div className="vin-body-row">
        <div>{!vin.issuance.assetamountcommitment ? t`Issuance amount` : t`Amount commitment`}</div>
        <div>{!vin.issuance.assetamountcommitment ? formatSat(vin.issuance.assetamount, '') // FIXME: use asset precision (requires https://github.com/ElementsProject/rust-elements/pull/19)
                                                  : <span className="mono">{vin.issuance.assetamountcommitment}</span>}</div>
      </div>

    , !vin.issuance.is_reissuance &&
        <div className="vin-body-row">
          <div>{!vin.issuance.tokenamountcommitment ? t`Reissuance keys` : t`Reissuance commitment`}</div>
          <div>{!vin.issuance.tokenamountcommitment ? (!vin.issuance.tokenamount ? t`No reissuance` : vin.issuance.tokenamount)
                                                    : <span className="mono">{vin.issuance.tokenamountcommitment}</span>}</div>
        </div>

    ] }

    { vin.scriptsig && [
      <div className="vin-body-row">
        <div>{t`scriptSig (asm)`}</div>
        <div className="mono">{vin.scriptsig_asm}</div>
      </div>
    , <div className="vin-body-row">
        <div>{t`scriptSig (hex)`}</div>
        <div className="mono">{vin.scriptsig}</div>
      </div>
    ] }

    { vin.witness && <div className="vin-body-row">
      <div>{t`Witness`}</div>
      <div className="mono">{vin.witness.join(' ')}</div>
    </div> }

    { vin.inner_redeemscript_asm && <div className="vin-body-row">
      <div>{t`P2SH redeem script`}</div>
      <div className="mono">{vin.inner_redeemscript_asm}</div>
    </div> }

    { vin.inner_witnessscript_asm && <div className="vin-body-row">
      <div>{t`P2WSH witness script`}</div>
      <div className="mono">{vin.inner_witnessscript_asm}</div>
    </div> }

    <div className="vin-body-row">
      <div>{t`nSequence`}</div>
      <div className="mono">{formatHex(vin.sequence)}</div>
    </div>

    { vin.prevout && [
      <div className="vin-body-row">
        <div>{t`Previous output script`}</div>
        <div className="mono">
          {vin.prevout.scriptpubkey_asm}
          {vin.prevout.scriptpubkey_type && <em> ({vin.prevout.scriptpubkey_type})</em>}
        </div>
      </div>

    , vin.prevout.scriptpubkey_address && <div className="vin-body-row">
        <div>{t`Previous output address`}</div>
        <div className="mono">{linkToAddr(vin.prevout.scriptpubkey_address)}</div>
      </div>
    ] }


  </div>
, { t, ...S }
)

export default (vin, opt) =>
  vin.is_pegin ? pegin(vin, opt)
               : standard(vin, opt)
