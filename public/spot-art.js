(() => {
  "use strict";

  // A small illustrated scene per spot — picked by keyword from the
  // name/building — rendered as a low-opacity, centered backdrop behind the
  // whole card. It adds zero layout height (position: absolute, full card),
  // and sits clear of the right-hand margin where the location tag, "updated"
  // timestamp and action buttons already live. Color is tied to the existing
  // location-tag palette (forest = on campus, gold = off campus). A handful
  // of shared motion primitives (wm-draw, wm-flow, wm-spin, wm-rise,
  // wm-pulse, wm-drift, wm-run) keep the set feeling like one system.

  const RULES = [
    { test: /rose float/, theme: "rose" },
    { test: /fab lab|bonderson/, theme: "fablab" },
    { test: /print lab|graphic communication/, theme: "printer" },
    { test: /design village|poly canyon/, theme: "campfire" },
    { test: /19 metro|metro station/, theme: "transit" },
    { test: /track-side|recreation center/, theme: "track" },
    { test: /higuera/, theme: "streetlights" },
    { test: /garden street/, theme: "flower" },
    { test: /linnaea|back patio/, theme: "espresso" },
    { test: /vista grande/, theme: "steam" },
    { test: /spanos|theatre/, theme: "stage" },
    { test: /uu plaza|plaza tables/, theme: "plaza" },
    { test: /greenhouse|plant shop/, theme: "greenhouse" },
    { test: /creekside|creek/, theme: "creek" },
    { test: /corner table|foothill|window/, theme: "rain" },
    { test: /dexter|oak|lawn/, theme: "tree" },
    { test: /baker science|atrium|science building/, theme: "atom" },
    { test: /breezeway|baker center/, theme: "breeze" },
    { test: /reading room|silo|stacks|library/, theme: "book" },
    { test: /lounge|union/, theme: "lounge" },
  ];

  function pickTheme(spot) {
    const haystack = `${spot.name || ""} ${spot.building || ""}`.toLowerCase();
    for (const rule of RULES) {
      if (rule.test.test(haystack)) return rule.theme;
    }
    return "desk";
  }

  const BUILDERS = {
    book: () => `
      <g opacity="0.85">
        <rect x="40" y="150" width="70" height="14" rx="2" transform="rotate(-4 75 157)"/>
        <rect x="48" y="140" width="66" height="13" rx="2" transform="rotate(3 81 146)"/>
      </g>
      <path pathLength="1" class="wm-draw" style="animation-duration:8s" d="M90 100 C70 92 45 94 30 100 V150 C45 144 70 142 90 150 C110 142 135 144 150 150 V100 C135 94 110 92 90 100 Z"/>
      <line x1="90" y1="100" x2="90" y2="150"/>
      <g stroke-width="1" opacity="0.55">
        <path d="M36 104 C50 100 70 100 84 104"/>
        <path d="M36 114 C50 110 70 110 84 114"/>
        <path d="M36 124 C50 120 70 120 84 124"/>
        <path d="M36 134 C50 130 70 130 84 134"/>
        <path d="M96 104 C110 100 130 100 144 104"/>
        <path d="M96 114 C110 110 130 110 144 114"/>
        <path d="M96 124 C110 120 130 120 144 124"/>
        <path d="M96 134 C110 130 130 130 144 134"/>
      </g>
      <path stroke-width="1.4" d="M90 100 V168 L86 160 L90 156 L94 160 Z"/>
      <circle class="wm-pulse" cx="132" cy="58" r="2" fill="currentColor" stroke="none"/>
      <circle class="wm-pulse" style="animation-delay:1.1s" cx="48" cy="48" r="1.6" fill="currentColor" stroke="none"/>
    `,
    breeze: () => `
      <g stroke-width="1.2" opacity="0.6">
        <path d="M20 208 q3 -10 0 -16"/>
        <path d="M30 208 q3 -12 -1 -18"/>
        <path d="M150 208 q-3 -9 1 -15"/>
      </g>
      <path stroke-width="2" d="M150 70 Q120 60 100 80 Q85 96 60 92"/>
      <g stroke-width="1.3">
        <path d="M40 60 q6 -8 14 -4 q-2 8 -14 4 Z"/>
        <path d="M55 40 q6 -7 13 -3 q-2 7 -13 3 Z"/>
        <path d="M75 100 q6 -7 13 -3 q-2 7 -13 3 Z"/>
      </g>
      <path class="wm-flow" style="animation-duration:5s" stroke-dasharray="5 7" d="M10 96 Q40 88 70 96 T140 96"/>
      <path class="wm-flow" style="animation-duration:6.2s;animation-direction:reverse" stroke-dasharray="5 7" d="M10 120 Q40 112 70 120 T140 120"/>
      <path class="wm-flow" style="animation-duration:7.4s" stroke-dasharray="5 7" opacity="0.6" d="M10 144 Q40 136 70 144 T140 144"/>
    `,
    atom: () => `
      <circle cx="90" cy="120" r="8" opacity="0.85"/>
      <g stroke-width="1" opacity="0.5">
        <line x1="90" y1="104" x2="90" y2="98"/>
        <line x1="90" y1="136" x2="90" y2="142"/>
        <line x1="74" y1="120" x2="68" y2="120"/>
        <line x1="106" y1="120" x2="112" y2="120"/>
      </g>
      <ellipse cx="90" cy="120" rx="60" ry="24" opacity="0.7"/>
      <ellipse cx="90" cy="120" rx="60" ry="24" opacity="0.7" transform="rotate(60 90 120)"/>
      <ellipse cx="90" cy="120" rx="60" ry="24" opacity="0.7" transform="rotate(120 90 120)"/>
      <g class="wm-spin" style="transform-origin:90px 120px"><circle cx="150" cy="120" r="3" fill="currentColor" stroke="none"/></g>
      <g class="wm-spin" style="transform-origin:90px 120px;animation-duration:9s;animation-direction:reverse" transform="rotate(60 90 120)"><circle cx="150" cy="120" r="2.4" fill="currentColor" stroke="none"/></g>
    `,
    tree: () => `
      <path pathLength="1" class="wm-draw" style="animation-duration:8.5s" d="M90 20 C60 20 45 45 50 65 C30 68 22 92 38 106 C30 118 38 138 58 136 C60 150 80 156 90 148 C100 156 120 150 122 136 C142 138 150 118 142 106 C158 92 150 68 130 65 C135 45 120 20 90 20 Z"/>
      <path stroke-width="2" d="M84 150 C82 165 80 180 78 200 M96 150 C98 165 100 180 102 200"/>
      <g stroke-width="1" opacity="0.5">
        <path d="M86 160 q2 8 -1 16"/>
        <path d="M94 165 q-2 8 1 15"/>
      </g>
      <path stroke-width="1.4" d="M78 200 q-10 4 -18 2 M102 200 q10 4 18 2"/>
      <path stroke-width="1.4" opacity="0.6" d="M20 205 q70 -10 140 0"/>
      <g stroke-width="1.3" opacity="0.8">
        <line x1="60" y1="200" x2="120" y2="200"/>
        <line x1="66" y1="200" x2="66" y2="192"/>
        <line x1="114" y1="200" x2="114" y2="192"/>
        <line x1="64" y1="192" x2="116" y2="192"/>
      </g>
      <circle class="wm-pulse" cx="64" cy="60" r="2" fill="currentColor" stroke="none"/>
      <circle class="wm-pulse" style="animation-delay:.8s" cx="110" cy="50" r="1.6" fill="currentColor" stroke="none"/>
      <circle class="wm-pulse" style="animation-delay:1.6s" cx="95" cy="80" r="1.4" fill="currentColor" stroke="none"/>
    `,
    rain: () => `
      <path opacity="0.85" d="M50 40 q-6 -14 12 -16 q4 -12 20 -10 q10 -10 22 -2 q16 -2 16 12 q12 2 10 14 q2 10 -10 12 H56 q-12 -2 -6 -10Z"/>
      <rect x="30" y="70" width="120" height="100" rx="3" stroke-width="2"/>
      <line stroke-width="1.4" x1="90" y1="70" x2="90" y2="170"/>
      <line stroke-width="1.4" x1="30" y1="120" x2="150" y2="120"/>
      <line stroke-width="2" x1="24" y1="170" x2="156" y2="170"/>
      <g stroke-width="1.3">
        <path d="M40 170 v-10 h14 v10 Z"/>
        <path d="M47 160 q-8 -10 -2 -20 M47 160 q8 -10 2 -18"/>
      </g>
      <line class="wm-flow" style="animation-duration:1.5s" stroke-dasharray="4 6" x1="55" y1="85" x2="50" y2="105"/>
      <line class="wm-flow" style="animation-duration:1.8s" stroke-dasharray="4 6" x1="75" y1="80" x2="70" y2="100"/>
      <line class="wm-flow" style="animation-duration:1.3s" stroke-dasharray="4 6" x1="105" y1="88" x2="100" y2="108"/>
      <line class="wm-flow" style="animation-duration:1.7s" stroke-dasharray="4 6" x1="128" y1="82" x2="123" y2="102"/>
      <ellipse class="wm-pulse" stroke-width="1" opacity="0.5" cx="90" cy="182" rx="10" ry="3"/>
    `,
    creek: () => `
      <path class="wm-flow" style="animation-duration:4s" d="M-4 110 Q20 96 40 110 T80 110 T120 110 T160 110 T200 110"/>
      <path class="wm-flow" style="animation-duration:5.2s;animation-direction:reverse" opacity="0.7" d="M-4 128 Q20 114 40 128 T80 128 T120 128 T160 128 T200 128"/>
      <path class="wm-flow" style="animation-duration:6.4s" opacity="0.5" d="M-4 146 Q20 132 40 146 T80 146 T120 146 T160 146 T200 146"/>
      <g opacity="0.85">
        <ellipse cx="60" cy="172" rx="14" ry="6"/>
        <ellipse cx="90" cy="178" rx="10" ry="5"/>
        <ellipse cx="118" cy="170" rx="12" ry="5.5"/>
      </g>
      <g stroke-width="1.3">
        <path d="M20 190 q-2 -30 4 -46"/>
        <path d="M28 190 q0 -26 -4 -40"/>
        <ellipse cx="24" cy="142" rx="3" ry="6"/>
      </g>
      <circle class="wm-pulse" stroke-width="1" opacity="0.5" cx="132" cy="96" r="6"/>
    `,
    greenhouse: () => `
      <path stroke-width="2" d="M65 170 L115 170 L108 200 H72 Z"/>
      <line stroke-width="2" x1="60" y1="170" x2="120" y2="170"/>
      <g stroke-width="1" opacity="0.5">
        <line x1="75" y1="172" x2="78" y2="176"/>
        <line x1="90" y1="172" x2="93" y2="176"/>
        <line x1="102" y1="172" x2="105" y2="176"/>
      </g>
      <g stroke-width="1.6">
        <path d="M90 170 C80 150 78 120 90 95"/>
        <path d="M90 140 C70 135 55 115 58 90"/>
        <path d="M90 150 C110 145 125 125 122 100"/>
      </g>
      <g stroke-width="0.9" opacity="0.5">
        <path d="M72 120 q6 3 10 8"/>
        <path d="M104 112 q-6 3 -10 8"/>
      </g>
      <path pathLength="1" class="wm-draw" style="animation-duration:5.5s" d="M90 95 q-10 -6 -8 -18 q10 2 8 18Z"/>
    `,
    stage: () => `
      <path stroke-width="2" d="M20 200 V60 Q20 24 90 24 Q160 24 160 60 V200"/>
      <g stroke-width="1.3" opacity="0.7">
        <path d="M28 60 q6 40 -2 80 q8 30 -4 58"/>
        <path d="M40 55 q6 45 -2 85 q8 28 -4 56"/>
        <path d="M152 60 q-6 40 2 80 q-8 30 4 58"/>
        <path d="M140 55 q-6 45 2 85 q-8 28 4 56"/>
      </g>
      <g stroke-width="1.3">
        <path d="M40 205 q10 -8 20 0"/>
        <path d="M65 205 q10 -8 20 0"/>
        <path d="M90 205 q10 -8 20 0"/>
        <path d="M115 205 q10 -8 20 0"/>
      </g>
      <line stroke-width="1.6" x1="90" y1="10" x2="90" y2="28"/>
      <path opacity="0.3" d="M78 40 L102 40 L112 62 H68 Z"/>
      <circle class="wm-pulse" cx="90" cy="32" r="4" fill="currentColor" stroke="none"/>
    `,
    plaza: () => `
      <rect x="10" y="170" width="160" height="35" opacity="0.12"/>
      <g stroke-width="1" opacity="0.5">
        <line x1="10" y1="175" x2="35" y2="205"/>
        <line x1="35" y1="170" x2="65" y2="205"/>
        <line x1="65" y1="170" x2="95" y2="205"/>
        <line x1="95" y1="170" x2="125" y2="205"/>
        <line x1="125" y1="170" x2="155" y2="205"/>
        <line x1="150" y1="170" x2="170" y2="195"/>
      </g>
      <g stroke-width="1.4">
        <line x1="30" y1="168" x2="70" y2="168"/>
        <line x1="34" y1="168" x2="34" y2="158"/>
        <line x1="66" y1="168" x2="66" y2="158"/>
        <line x1="32" y1="158" x2="68" y2="158"/>
      </g>
      <rect stroke-width="1.6" x="115" y="150" width="30" height="18"/>
      <circle opacity="0.6" cx="130" cy="130" r="18"/>
      <line stroke-width="1.6" x1="130" y1="148" x2="130" y2="150"/>
      <line stroke-width="1.6" x1="90" y1="70" x2="90" y2="165"/>
      <path d="M82 70 L98 70 L90 55 Z"/>
      <circle class="wm-pulse" cx="90" cy="68" r="3" fill="currentColor" stroke="none"/>
    `,
    steam: () => `
      <ellipse stroke-width="1.6" cx="90" cy="175" rx="46" ry="8"/>
      <path stroke-width="2" d="M55 110 L125 110 L118 168 Q90 178 62 168 Z"/>
      <ellipse stroke-width="2" cx="90" cy="110" rx="35" ry="8"/>
      <path stroke-width="2" d="M124 122 Q150 122 150 140 Q150 158 124 154"/>
      <g stroke-width="1.3" opacity="0.8">
        <line x1="140" y1="170" x2="155" y2="185"/>
        <ellipse cx="138" cy="167" rx="5" ry="3" transform="rotate(30 138 167)"/>
      </g>
      <path class="wm-rise" d="M75 100 Q68 85 78 70 Q85 58 76 45"/>
      <path class="wm-rise" style="animation-delay:1s" d="M100 100 Q108 85 98 70 Q92 58 102 45"/>
      <g opacity="0.6">
        <ellipse cx="35" cy="60" rx="6" ry="9" transform="rotate(-20 35 60)"/>
        <path stroke-width="1" d="M35 53 q0 7 0 14"/>
      </g>
    `,
    fablab: () => `
      <rect stroke-width="2" x="20" y="30" width="140" height="150" rx="4"/>
      <line stroke-width="1.6" x1="30" y1="160" x2="150" y2="160"/>
      <g stroke-width="0.9" opacity="0.5">
        <line x1="40" y1="160" x2="44" y2="168"/>
        <line x1="60" y1="160" x2="64" y2="168"/>
        <line x1="80" y1="160" x2="84" y2="168"/>
        <line x1="100" y1="160" x2="104" y2="168"/>
        <line x1="120" y1="160" x2="124" y2="168"/>
      </g>
      <path pathLength="1" class="wm-draw" style="animation-duration:5s" d="M75 160 Q75 150 90 150 Q105 150 105 160 M78 150 Q78 142 90 142 Q102 142 102 150 M81 142 Q81 135 90 135 Q99 135 99 142"/>
      <line stroke-width="1.6" opacity="0.7" x1="20" y1="50" x2="160" y2="50"/>
      <rect class="wm-drift" x="40" y="44" width="14" height="14" rx="2"/>
      <circle class="wm-pulse" cx="145" cy="42" r="3" fill="currentColor" stroke="none"/>
    `,
    streetlights: () => `
      <line stroke-width="1.8" x1="20" y1="60" x2="20" y2="200"/>
      <line stroke-width="1.8" x1="160" y1="60" x2="160" y2="200"/>
      <path stroke-width="1.6" d="M20 70 Q90 120 160 70"/>
      <g stroke-width="1.3">
        <path d="M40 84 q0 6 4 6 q4 0 4 -6"/>
        <path d="M65 100 q0 6 4 6 q4 0 4 -6"/>
        <path class="wm-pulse" style="transform-origin:91px 110px" d="M87 107 q0 6 4 6 q4 0 4 -6"/>
        <path d="M115 100 q0 6 4 6 q4 0 4 -6"/>
        <path d="M140 84 q0 6 4 6 q4 0 4 -6"/>
      </g>
      <path stroke-width="1.4" opacity="0.5" d="M10 200 L40 200 L40 185 L60 170 L80 185 L80 200 L170 200"/>
    `,
    espresso: () => `
      <ellipse stroke-width="1.6" cx="88" cy="172" rx="40" ry="7"/>
      <path stroke-width="2" d="M58 115 L118 115 L112 160 Q88 168 64 160 Z"/>
      <ellipse stroke-width="2" cx="88" cy="115" rx="30" ry="7"/>
      <path stroke-width="1.8" d="M116 124 Q138 124 138 138 Q138 152 116 149"/>
      <path class="wm-rise" d="M76 106 Q70 92 78 78"/>
      <path class="wm-rise" style="animation-delay:.9s" d="M96 106 Q102 92 94 78"/>
      <g stroke-width="1.3" opacity="0.7">
        <circle cx="30" cy="60" r="1.6" fill="currentColor" stroke="none"/>
        <circle cx="45" cy="45" r="1.6" fill="currentColor" stroke="none"/>
        <circle cx="60" cy="60" r="1.6" fill="currentColor" stroke="none"/>
        <path d="M30 60 Q45 46 60 60" stroke-width="1"/>
      </g>
    `,
    track: () => `
      <ellipse stroke-width="2" cx="90" cy="150" rx="70" ry="38"/>
      <ellipse stroke-width="1.4" opacity="0.6" cx="90" cy="150" rx="50" ry="26"/>
      <g stroke-width="1" opacity="0.5">
        <line x1="90" y1="112" x2="90" y2="124"/>
        <line x1="145" y1="130" x2="133" y2="136"/>
        <line x1="145" y1="170" x2="133" y2="164"/>
        <line x1="90" y1="188" x2="90" y2="176"/>
        <line x1="35" y1="170" x2="47" y2="164"/>
        <line x1="35" y1="130" x2="47" y2="136"/>
      </g>
      <line stroke-width="1.6" x1="160" y1="140" x2="160" y2="160"/>
      <g class="wm-run" stroke-width="1.6">
        <circle cx="0" cy="-5" r="3" fill="currentColor" stroke="none"/>
        <line x1="0" y1="-2" x2="0" y2="6"/>
        <line x1="0" y1="6" x2="-4" y2="14"/>
        <line x1="0" y1="6" x2="4" y2="12"/>
        <line x1="0" y1="0" x2="-5" y2="3"/>
        <line x1="0" y1="0" x2="5" y2="-2"/>
      </g>
    `,
    printer: () => `
      <rect stroke-width="2" x="30" y="90" width="120" height="60" rx="4"/>
      <path stroke-width="1.6" opacity="0.8" d="M45 90 L60 55 L140 55 L135 90"/>
      <path stroke-width="1.6" opacity="0.8" d="M30 140 L15 155 L165 155 L150 140"/>
      <g class="wm-rise">
        <rect stroke-width="1.6" x="55" y="70" width="70" height="50"/>
        <g stroke-width="0.9" opacity="0.5">
          <line x1="63" y1="82" x2="117" y2="82"/>
          <line x1="63" y1="92" x2="110" y2="92"/>
          <line x1="63" y1="102" x2="115" y2="102"/>
        </g>
      </g>
      <circle class="wm-pulse" cx="140" cy="100" r="3" fill="currentColor" stroke="none"/>
    `,
    rose: () => `
      <line stroke-width="2" x1="90" y1="210" x2="90" y2="110"/>
      <g stroke-width="1.3">
        <path d="M90 180 l-8 -4"/>
        <path d="M90 160 l8 -4"/>
        <path d="M90 140 l-8 -4"/>
      </g>
      <g stroke-width="1.5">
        <path d="M90 170 C75 168 65 155 66 140 C82 142 90 155 90 170 Z"/>
        <path d="M90 150 C105 148 115 135 114 120 C98 122 90 135 90 150 Z"/>
      </g>
      <path pathLength="1" class="wm-draw" style="animation-duration:7s" d="M90 95 C78 90 72 78 78 66 C90 70 96 82 90 95 Z M90 95 C102 90 108 78 102 66 C90 70 84 82 90 95 Z M90 90 C76 88 66 76 70 62 C84 64 92 76 90 90 Z M90 90 C104 88 114 76 110 62 C96 64 88 76 90 90 Z M90 85 C90 70 96 58 90 46 C84 58 90 70 90 85 Z"/>
      <circle opacity="0.6" cx="90" cy="88" r="4"/>
      <g stroke-width="1.4" opacity="0.8">
        <path d="M55 140 C50 135 50 126 56 122 C62 126 62 135 55 140 Z"/>
        <line x1="55" y1="140" x2="55" y2="170"/>
      </g>
    `,
    campfire: () => `
      <path stroke-width="1.4" opacity="0.4" d="M30 200 L55 160 L80 200 Z"/>
      <line stroke-width="1" opacity="0.4" x1="55" y1="160" x2="55" y2="200"/>
      <g stroke-width="1.8">
        <ellipse cx="70" cy="192" rx="30" ry="6" transform="rotate(-8 70 192)"/>
        <ellipse cx="110" cy="192" rx="30" ry="6" transform="rotate(8 110 192)"/>
      </g>
      <g opacity="0.7">
        <circle cx="42" cy="188" r="5"/>
        <circle cx="138" cy="188" r="5"/>
      </g>
      <path class="wm-pulse" style="transform-origin:90px 190px" d="M90 190 Q70 170 82 140 Q88 125 80 108 Q100 120 100 140 Q112 165 90 190 Z"/>
      <path opacity="0.7" d="M90 188 Q78 172 86 150 Q90 138 86 124 Q98 134 96 150 Q104 168 90 188 Z"/>
      <path opacity="0.5" d="M90 185 Q84 174 88 160 Q90 152 88 144 Q94 150 93 160 Q98 172 90 185 Z"/>
      <path class="wm-rise" style="animation-duration:4s" d="M88 106 Q78 94 88 82 Q96 72 86 58"/>
      <circle class="wm-pulse" style="animation-delay:.5s" cx="70" cy="130" r="2" fill="currentColor" stroke="none"/>
      <circle class="wm-pulse" style="animation-delay:1.2s" cx="106" cy="120" r="1.6" fill="currentColor" stroke="none"/>
      <g opacity="0.5">
        <circle cx="30" cy="40" r="1.4" fill="currentColor" stroke="none"/>
        <circle cx="150" cy="30" r="1.4" fill="currentColor" stroke="none"/>
        <circle cx="130" cy="55" r="1.2" fill="currentColor" stroke="none"/>
      </g>
    `,
    transit: () => `
      <line stroke-width="1.6" opacity="0.5" x1="10" y1="195" x2="170" y2="195"/>
      <circle cx="30" cy="195" r="2" fill="currentColor" stroke="none"/>
      <circle cx="90" cy="195" r="2" fill="currentColor" stroke="none"/>
      <circle cx="150" cy="195" r="2" fill="currentColor" stroke="none"/>
      <line stroke-width="1.6" x1="150" y1="150" x2="150" y2="195"/>
      <rect stroke-width="1.4" x="146" y="138" width="16" height="12" rx="2"/>
      <g class="wm-drift" style="animation-duration:5s">
        <path stroke-width="2" d="M20 150 Q20 138 32 138 H88 Q98 138 98 150 V178 H20 Z"/>
        <g stroke-width="1.4">
          <rect x="28" y="144" width="16" height="14" rx="2"/>
          <rect x="48" y="144" width="16" height="14" rx="2"/>
          <rect x="68" y="144" width="16" height="14" rx="2"/>
        </g>
        <circle cx="34" cy="180" r="6"/>
        <circle cx="84" cy="180" r="6"/>
        <circle cx="34" cy="180" r="2" fill="currentColor" stroke="none"/>
        <circle cx="84" cy="180" r="2" fill="currentColor" stroke="none"/>
      </g>
    `,
    flower: () => `
      <line stroke-width="2" x1="90" y1="210" x2="90" y2="120"/>
      <g stroke-width="1.5">
        <path d="M90 175 C74 172 64 160 66 146 C82 148 90 160 90 175 Z"/>
        <path d="M90 160 C106 157 116 145 114 131 C98 133 90 145 90 160 Z"/>
      </g>
      <g stroke-width="1.4">
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(0 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(40 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(80 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(120 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(160 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(200 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(240 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(280 90 95)"/>
        <ellipse cx="90" cy="70" rx="6" ry="14" transform="rotate(320 90 95)"/>
      </g>
      <circle class="wm-pulse" style="animation-duration:4s" cx="90" cy="95" r="10"/>
      <g stroke-width="1.3" opacity="0.8">
        <ellipse cx="55" cy="150" rx="5" ry="9"/>
        <line x1="55" y1="159" x2="55" y2="190"/>
      </g>
      <g stroke-width="1" opacity="0.4">
        <path d="M30 208 q2 -8 0 -14"/>
        <path d="M140 208 q-2 -8 0 -14"/>
      </g>
    `,
    lounge: () => `
      <ellipse opacity="0.35" stroke-width="1.4" cx="90" cy="205" rx="75" ry="12"/>
      <path stroke-width="2" d="M35 200 V150 Q35 138 47 138 H100 Q112 138 112 150 V200"/>
      <path stroke-width="1.6" d="M35 175 H20 V195 H35"/>
      <path stroke-width="1.6" d="M112 175 H127 V195 H112"/>
      <line stroke-width="2" x1="35" y1="200" x2="112" y2="200"/>
      <g stroke-width="1" opacity="0.5">
        <path d="M55 145 q4 6 0 12"/>
        <path d="M75 145 q4 6 0 12"/>
        <path d="M95 145 q4 6 0 12"/>
      </g>
      <line stroke-width="1.8" x1="135" y1="178" x2="165" y2="178"/>
      <line stroke-width="1.4" x1="140" y1="178" x2="140" y2="200"/>
      <line stroke-width="1.4" x1="160" y1="178" x2="160" y2="200"/>
      <path stroke-width="1.3" d="M145 168 h10 v8 a5 5 0 0 1 -10 0 Z"/>
      <line stroke-width="1.8" x1="150" y1="60" x2="150" y2="178"/>
      <path stroke-width="1.6" d="M135 60 L165 60 L172 78 H128 Z"/>
      <ellipse class="wm-pulse" opacity="0.5" cx="150" cy="50" rx="14" ry="8"/>
    `,
    desk: () => `
      <line stroke-width="2" x1="15" y1="165" x2="165" y2="165"/>
      <line stroke-width="1.6" x1="25" y1="165" x2="25" y2="200"/>
      <line stroke-width="1.6" x1="155" y1="165" x2="155" y2="200"/>
      <g stroke-width="1.6">
        <rect x="35" y="148" width="42" height="10" rx="1" transform="rotate(-2 56 153)"/>
        <rect x="38" y="138" width="38" height="9" rx="1" transform="rotate(2 57 142)"/>
      </g>
      <path stroke-width="1.6" d="M95 150 H145 L150 164 H90 Z"/>
      <path stroke-width="1.6" d="M98 150 V128 H142 V150"/>
      <ellipse stroke-width="1.6" cx="140" cy="164" rx="14" ry="4"/>
      <line stroke-width="1.8" x1="140" y1="160" x2="152" y2="130"/>
      <circle cx="152" cy="130" r="2.4"/>
      <line stroke-width="1.8" x1="152" y1="130" x2="130" y2="100"/>
      <path stroke-width="1.6" d="M118 92 L142 92 L150 110 H110 Z"/>
      <ellipse class="wm-pulse" opacity="0.5" cx="130" cy="106" rx="16" ry="9"/>
    `,
  };

  function render(spot) {
    const theme = pickTheme(spot);
    const builder = BUILDERS[theme] || BUILDERS.desk;
    return `<svg class="spot-watermark" data-theme="${theme}" data-location="${spot.location_type || "on_campus"}" viewBox="0 0 180 220" preserveAspectRatio="xMidYMax meet" role="img" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${builder()}</svg>`;
  }

  window.SpotArt = { render, pickTheme };
})();
