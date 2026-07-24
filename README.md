# 🎵 KLIKY-BEAT (네온 키캡 리듬 게임) `v1.1.0`

KLIKY-BEAT는 웹 기반의 고감도 기계식 키보드 타건형 리듬 액션 게임입니다. 화려한 네온 스타일의 3D 소실점 라인과 초고사양 웹 오디오 엔진(Web Audio API)을 활용해 입체감 넘치는 플레이 환경을 제공합니다.

이 프로젝트는 특히 모바일 세로 화면 환경에 특화되어 설계되었으며, 기계식 키보드의 독보적인 타건음(SFX)을 커스터마이징하여 연주할 수 있습니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 🎛️ 하이퍼 리얼리스틱 3D 키캡 피지컬 모델링

- **PBT 이중사출 키캡 재현:** 입체적인 경사각(Bevel), 손가락 굴곡을 재현한 오목한 디시(Dish) 곡면, 타이핑 압축 피드백(Transform Translate)을 CSS로 하이퍼 리얼하게 구현.
- **RGB LED 언더글로우 광원:** 키를 누를 때마다 바닥부의 네온 백라이트 투과율이 반응하는 리액티브 조명 시스템 탑재.

### 2. 🛣️ 3D 소실점 판정 및 원근법 궤적

- 2D 평면 채보 출력을 극복하고, 화면 상단 소실점(Vanishing Point)으로부터 판정 라인까지 원근 가속 법칙(Perspective scaling)에 따라 노트가 쏟아져 내리는 역동적 레이아웃 설계.
- 단타 노트(Tap Note) 및 잔향감이 투과되는 롱노트(Hold Note) 구현.

### 3. 🔊 Web Audio API 기반 오디오 엔진

- **초저지연(Ultra-Low Latency) 디코딩:** 오디오 콘텍스트 버퍼 프리로딩 및 디코더 캐싱.
- **기계식 타건음 랜덤 재생:** 10종의 고품질 기계식 키캡 타건음을 칠 때마다 미세한 피치(Pitch) 변조(0.95x ~ 1.05x)와 함께 무작위 재생하여 실제 키보드를 치는 듯한 질감 제공.
- **통합 오디오 믹서:** 환경설정에서 BGM과 타건음(SFX) 볼륨을 독립적으로 제어 가능.

### 4. ⏸️ 스마트 게임 중단 및 3초 카운트다운 이어하기

- 재생 중인 오디오 엔진 전체를 완전히 정지(Suspend)시키는 안전한 일시정지 시스템.
- 이어하기(Resume) 시 화면을 정지시키고 중앙에 **"3 ➔ 2 ➔ 1" 네온 카운트다운 연출** 후 오디오와 프레임을 일관되게 이어 재생하는 스마트 싱크 브릿지 구현.

---

## 📂 프로젝트 구조 (Folder Structure)

```bash
src/
├── components/
│   ├── Keycap.jsx            # 3D 기계식 키캡 컴포넌트
│   ├── Keycap.css            # 키캡 입체 디자인 및 LED 발광 스타일
│   ├── IntroScreen.jsx       # 오프닝 인트로 스위치 바운스 화면
│   ├── IntroScreen.css       # 인트로 네온 점멸 스타일
│   ├── PlaylistScreen.jsx    # 곡 선택 플레이리스트 화면
│   ├── PlaylistScreen.css    # 플레이리스트 및 곡 카드 카드 UI
│   ├── SongDetailsScreen.jsx # 속도 및 레코드 회전 상세 화면
│   ├── SongDetailsScreen.css # 회전하는 바이닐 디스크 연출
│   ├── GamePlayScreen.jsx    # 3D 판정 캔버스 게임 루프 핵심 화면
│   ├── GamePlayScreen.css    # 게임판, 일시정지 버튼 및 콤보 폰트
│   ├── SettingsModal.jsx     # 오디오 볼륨 조절 설정 모달
│   └── SettingsModal.css     # 환경설정 슬라이더 슬라이드 UI
├── App.jsx                   # 글로벌 네비게이션 및 오디오 캐싱 중앙 관리
├── App.css                   # 글로벌 테마 컬러 및 공통 레이아웃
└── main.jsx                  # React 마운트 진입점
```

---

## ⚙️ 시작하기 (Quick Start)

### 의존성 설치

```bash
npm install
```

### 로컬 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

---

## 📄 라이선스 (License)

Copyright 2026 rodotsian10.

Licensed under the **Apache License, Version 2.0** (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
