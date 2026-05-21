import yarnSvg from '../../assets/yarn.svg'

// action: 'idle' | 'walk' | 'wave' | 'bow' | 'sit' | 'lookup'
export default function Yarnly({ color = '#FFB3B3', action = 'idle', size = 80 }) {
  // coordinate space matches yarnly.svg viewBox (96 × 107)
  const vw = 96, vh = 107
  const scale = size / vh

  const [rArmX, rArmY] = action === 'wave' ? [93, 26] : action === 'bow' ? [93, 68] : [93, 63.7]
  const [lArmX, lArmY] = action === 'bow' ? [4, 68] : [4, 61.7]
  const [lHndX, lHndY] = action === 'bow' ? [3, 69] : [3, 62.7]
  const pupilDY  = action === 'lookup' ? -2 : 0
  const eyeOffX  = action === 'walk'   ? -3 : 0   // 歩行時は目を左寄りに
  const bodyRotate = action === 'bow'  ? 'rotate(-8 51 40.7)' : undefined
  const walkTilt   = action === 'walk' ? 'rotate(-3 48 75)'   : undefined

  return (
    <svg
      width={vw * scale}
      height={vh * scale}
      viewBox={`0 0 ${vw} ${vh}`}
      overflow="visible"
    >
      <defs>
        {/* yarn.svg の全不透明ピクセルを白に変換 → SVGマスクとして使用 */}
        <filter id="yarn-whiten" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 1 0" />
        </filter>
        <mask id="yarn-body-mask" maskUnits="userSpaceOnUse">
          <image href={yarnSvg} x="9.8" y="0" width="83" height="82"
            filter="url(#yarn-whiten)" />
        </mask>
      </defs>

      {/* 歩行時は体全体を少し左に傾ける */}
      <g transform={walkTilt}>

        {/* 足（ボディの後ろ） */}
        {action === 'walk' ? (
          <>
            {/* 左足：前（左・低）→ 後ろ（右・高）を繰り返す */}
            <path stroke="#CB886A" strokeWidth="3" strokeLinecap="round" fill="none">
              <animate attributeName="d"
                values="M38 74.7L33 105H27;M38 74.7L43 98H47;M38 74.7L33 105H27"
                dur="0.56s" repeatCount="indefinite"
                calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" />
            </path>
            {/* 右足：逆位相 — 後ろ（右・高）から開始 */}
            <path stroke="#CB886A" strokeWidth="3" strokeLinecap="round" fill="none">
              <animate attributeName="d"
                values="M63 74.7L69 98H73;M63 74.7L57 105H53;M63 74.7L69 98H73"
                dur="0.56s" repeatCount="indefinite"
                calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" />
            </path>
          </>
        ) : (
          <>
            <path d="M38 74.7L31 104.2H25" stroke="#CB886A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="25" cy="104.2" r="2.5" fill="#CB886A" />
            <path d="M63 74.7L71 104.7H63"  stroke="#CB886A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="63" cy="104.7" r="2.5" fill="#CB886A" />
          </>
        )}

        <g transform={bodyRotate}>
          {/* ボディ: yarn.svg のパス形状で選択色を塗る（横線なし） */}
          <rect x="9" y="-1" width="85" height="84" fill={color} mask="url(#yarn-body-mask)" />

          {/* 左腕 */}
          <line x1="16" y1="49.7" x2={lArmX} y2={lArmY} stroke="#CB886A" strokeWidth="3" strokeLinecap="round" />
          <circle cx={lHndX} cy={lHndY} r="2.5" fill="#CB886A" />

          {/* 右腕 */}
          <line x1="81" y1="49.7" x2={rArmX} y2={rArmY} stroke="#CB886A" strokeWidth="3" strokeLinecap="round" />
          <circle cx={rArmX} cy={rArmY} r="2.5" fill="#CB886A" />

          {/* 目（歩行時は左寄り） */}
          <circle cx={38 + eyeOffX} cy="43.7" r="5" fill="white" />
          <circle cx={51 + eyeOffX} cy="43.7" r="5" fill="white" />
          <circle cx={39 + eyeOffX} cy={42.7 + pupilDY} r="2.5" fill="black" />
          <circle cx={52 + eyeOffX} cy={42.7 + pupilDY} r="2.5" fill="black" />
        </g>

      </g>
    </svg>
  )
}
