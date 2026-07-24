# 📱 KLIKY-BEAT 안드로이드 APK 빌드 가이드 문서

본 프로젝트는 **React + Vite** 웹 앱을 **Capacitor**를 이용하여 안드로이드 네이티브 APK 파일로 빌드하도록 구성되어 있습니다.

---

## 📋 필수 사전 준비 요소

1. **Node.js** (v18 이상 권장)
2. **Java Development Kit (JDK 17)**: Android Gradle 빌드 시 JDK 17 이상 필요
3. **Android Studio**: Android SDK 및 Gradle 빌드 도구 포함

---

## 🚀 APK 빌드 명령어 절차 (3단계)

터미널(PowerShell / CMD)에서 프로젝트 루트 디렉토리(`e:\dogack`)로 이동 후 순서대로 명령어들을 실행합니다.

### 1단계: 웹 앱 프론트엔드 최신 빌드 & Capacitor 동기화
```powershell
# 1. Vite 웹 빌드 실행 (dist/ 폴더 생성)
npm run build

# 2. Capacitor 안드로이드 플랫폼에 최신 dist 빌드 파일 복사 및 동기화
npx cap sync android
```

---

### 2단계: 안드로이드 프로젝트 열기 및 APK 빌드

#### 방법 A: Android Studio GUI에서 빌드하기 (추천)
```powershell
# Android Studio에서 android 프로젝트 열기
npx cap open android
```
1. Android Studio가 실행되면 Gradle Sync가 끝날 때까지 잠시 기다립니다.
2. 상단 메뉴바에서 **`Build`** ➔ **`Build Bundle(s) / APK(s)`** ➔ **`Build APK(s)`** 선택.
3. 빌드가 완료되면 오른쪽 하단에 `APK(s) generated successfully.` 알림창이 뜹니다.
4. 알림창의 **`locate`** 버튼을 누르면 생성된 `app-debug.apk` 파일 위치 폴더가 열립니다.

---

#### 방법 B: 터미널 명령어(CLI)로 직접 APK 자동 빌드하기 (Android Studio 없이)
Android Studio 설정이 안드로이드 SDK 환경변수에 등록되어 있는 경우, 명령어 하나로 직접 APK를 출력할 수 있습니다.

```powershell
# android 폴더로 이동 후 gradle 명령어로 debug APK 빌드
cd android
.\gradlew assembleDebug
cd ..
```

- **출력 경로**: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 🛠️ 주요 패키지 및 설정 정보

- **App ID**: `com.rodotsian10.klikybeat`
- **App Name**: `KLIKY-BEAT`
- **Capacitor Config**: `capacitor.config.json`
- **Web Build Folder**: `dist`
- **Capacitor App Plugin**: 안드로이드에서 앱 백그라운드 전환 시 자동 일시정지(`@capacitor/app`) 연동 완료

---

## ⚠️ 자주 발생하는 문제 및 해결법

1. **`cap sync` 수행 시 `dist` 폴더를 찾을 수 없다는 에러 발생**
   - 원인: `npm run build`를 수행하지 않았거나 실패한 경우
   - 해결: `npm run build` 명령을 먼저 실행하여 `dist` 폴더가 잘 생성되었는지 확인 후 `npx cap sync` 재실행

2. **Gradle JDK 버전 에러 (`Unsupported Java Version`)**
   - 원인: Android Studio의 JDK 버전 설정이 낮을 때 발생
   - 해결: Android Studio ➔ `Settings` ➔ `Build, Execution, Deployment` ➔ `Build Tools` ➔ `Gradle` 메뉴에서 Gradle JDK를 **`JDK 17`** 이상으로 지정
