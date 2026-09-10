import { useState } from 'react'
import './AddressSearchField.css'

const POSTCODE_SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let postcodeScriptPromise = null

function loadPostcodeScript() {
  if (window.daum?.Postcode) return Promise.resolve()
  if (postcodeScriptPromise) return postcodeScriptPromise
  postcodeScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = POSTCODE_SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => {
      postcodeScriptPromise = null
      reject(new Error('주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'))
    }
    document.head.appendChild(script)
  })
  return postcodeScriptPromise
}

// 다음(카카오) 우편번호 서비스 팝업으로 실제 존재하는 도로명 주소만 검색해서
// 채워 넣는 입력란. 오배송을 줄이기 위해 도로명 주소 본문은 직접 타이핑하지
// 않고 반드시 이 팝업에서 검색한 값만 쓰도록 읽기전용으로 두고, 동/호수 등
// 상세주소만 별도로 입력받는다.
export default function AddressSearchField({ roadAddress, detailAddress, onChangeRoadAddress, onChangeDetailAddress }) {
  const [loadError, setLoadError] = useState(null)

  const handleSearch = async () => {
    setLoadError(null)
    try {
      await loadPostcodeScript()
      new window.daum.Postcode({
        oncomplete: (data) => {
          onChangeRoadAddress(data.roadAddress || data.jibunAddress || '')
        },
      }).open()
    } catch (err) {
      setLoadError(err.message || String(err))
    }
  }

  return (
    <div className="address-search-field">
      <div className="address-search-field__row">
        <input
          type="text"
          className="field-input"
          value={roadAddress}
          readOnly
          placeholder="주소 검색 버튼을 눌러 도로명 주소를 찾아주세요"
        />
        <button type="button" className="btn btn--ghost" onClick={handleSearch}>
          주소 검색
        </button>
      </div>
      <input
        type="text"
        className="field-input"
        value={detailAddress}
        onChange={(e) => onChangeDetailAddress(e.target.value)}
        placeholder="상세주소 (동/호수 등)"
      />
      {loadError && <p className="order-panel__notice">⚠ {loadError}</p>}
    </div>
  )
}
