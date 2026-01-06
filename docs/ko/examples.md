# 사용 예제 가이드

**언어**: [English](../examples.md) | 한국어

electron-log-cleaner의 다양한 사용 사례를 보여주는 실용적인 예제 모음입니다.

## 목차

- [기본 사용법](#기본-사용법)
- [Electron 통합](#electron-통합)
- [커스텀 설정](#커스텀-설정)
- [수동 정리 및 통계](#수동-정리-및-통계)
- [에러 처리](#에러-처리)
- [고급 패턴](#고급-패턴)

---

## 기본 사용법

가장 간단한 사용 방법입니다. 최소한의 설정으로 자동 로그 정리를 시작할 수 있습니다.

### 예제 코드

```javascript
const cleaner = require('electron-log-cleaner');

// 최소 설정 - 보관 일수만 지정
cleaner.setup({
  maxAge: 30, // 30일간 로그 보관
});

console.log('로그 cleaner가 30일 보관 정책으로 초기화되었습니다');
console.log('로그는 자정에 자동으로 회전됩니다');
console.log('오래된 로그는 자동으로 정리됩니다');

// 현재 통계 조회
const stats = cleaner.getStats();
console.log('\n현재 로그 통계:');
console.log(`- 전체 파일: ${stats.totalFiles}`);
console.log(`- 전체 크기: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`- 로그 디렉토리: ${stats.logDir}`);
```

### 주요 포인트

- `maxAge`만 설정하면 electron-log가 자동으로 감지됩니다
- 별도 코드 없이 자정에 자동으로 회전합니다
- 앱 종료 시 자동으로 정리가 실행됩니다

### 실행 방법

```bash
node examples/basic-usage.js
```

---

## Electron 통합

Electron 애플리케이션의 메인 프로세스에 통합하는 방법입니다.

### 예제 코드

```javascript
const { app, BrowserWindow } = require('electron');
const log = require('electron-log/main');
const cleaner = require('electron-log-cleaner');

// 앱이 준비되면 로그 cleaner 설정
app.whenReady().then(() => {
  // 로그 cleaner 설정
  cleaner.setup({
    maxAge: 30,
    electronLog: log,
    fileTransport: {
      maxSize: 10 * 1024 * 1024, // 파일당 10 MB
      format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}',
      level: 'info',
    },
    onError: (error) => {
      log.error('로그 cleaner 에러:', error);
    },
  });

  log.info('애플리케이션 시작됨');
  log.info('로그 cleaner가 30일 보관 정책으로 초기화되었습니다');

  // 통계 가져오기 및 로깅
  const stats = cleaner.getStats();
  log.info(
    `로그 통계: ${stats.totalFiles}개 파일, ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`
  );

  // 브라우저 윈도우 생성
  createWindow();
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    log.info('메인 윈도우 닫힘');
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    log.info('모든 윈도우 닫힘, 앱 종료');
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 앱 에러 처리
process.on('uncaughtException', (error) => {
  log.error('포착되지 않은 예외:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('처리되지 않은 Rejection:', promise, 'reason:', reason);
});
```

### 주요 포인트

- `app.whenReady()`에서 cleaner 설정
- electron-log 인스턴스를 명시적으로 전달
- 파일 전송 옵션으로 로그 형식 커스터마이즈
- 에러 콜백으로 문제 추적

---

## 커스텀 설정

고급 설정 옵션과 환경별 다른 설정을 사용하는 방법입니다.

### 예제 코드

```javascript
const log = require('electron-log/main');
const cleaner = require('electron-log-cleaner');

// 커스텀 설정으로 구성
cleaner.setup({
  // 7일간 로그 보관 (개발용으로 유용)
  maxAge: 7,

  // electron-log 인스턴스 명시적 제공
  electronLog: log,

  // 커스텀 파일 전송 설정
  fileTransport: {
    // 파일 크기를 5 MB로 제한
    maxSize: 5 * 1024 * 1024,

    // 타임스탬프가 있는 커스텀 로그 형식
    format: '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}',

    // info 레벨 이상만 로깅
    level: 'info',
  },

  // 모니터링을 위한 에러 콜백
  onError: (error) => {
    console.error('로그 cleaner에서 에러 발생:', error);

    // 여기서 모니터링 서비스로 에러 전송 가능
    // 예: Sentry.captureException(error);
  },
});

// 다양한 레벨로 로깅 테스트
log.error('에러 메시지입니다');
log.warn('경고 메시지입니다');
log.info('정보 메시지입니다');
log.verbose('이 verbose 메시지는 로깅되지 않습니다 (level: info)');
log.debug('이 debug 메시지는 로깅되지 않습니다 (level: info)');

console.log('\n로그 cleaner 설정:');
console.log('- 보관 기간: 7일');
console.log('- 최대 파일 크기: 5 MB');
console.log('- 로그 레벨: info 이상');
console.log('- 타임스탬프가 있는 커스텀 형식');

// 통계 가져오기
const stats = cleaner.getStats();
console.log('\n현재 통계:');
console.log(`- 전체 파일: ${stats.totalFiles}`);
console.log(`- 전체 크기: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`- 로그 디렉토리: ${stats.logDir}`);

// 예제: 환경별 다른 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

if (isDevelopment) {
  console.log('\n개발 모드: debug 로깅과 함께 7일 보관 사용');
} else if (isProduction) {
  console.log('\n프로덕션 모드: info 로깅과 함께 30일 보관 고려');
}
```

### 환경별 설정 패턴

```javascript
const isDev = process.env.NODE_ENV === 'development';

cleaner.setup({
  maxAge: isDev ? 7 : 30, // 개발: 7일, 프로덕션: 30일
  fileTransport: {
    level: isDev ? 'debug' : 'info', // 개발: 더 자세하게
    maxSize: isDev ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
  },
});
```

---

## 수동 정리 및 통계

수동으로 정리를 트리거하고 로그 파일 통계를 다루는 방법입니다.

### 예제 코드

```javascript
const cleaner = require('electron-log-cleaner');

cleaner.setup({ maxAge: 30 });

console.log('로그 cleaner 초기화됨\n');

// 통계를 형식화된 방식으로 표시하는 함수
function displayStats(stats) {
  if (stats.error) {
    console.error('통계 조회 에러:', stats.error);
    return;
  }

  console.log('로그 통계:');
  console.log('===============');
  console.log(`전체 파일: ${stats.totalFiles}`);
  console.log(`전체 크기: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`로그 디렉토리: ${stats.logDir}`);
  console.log(`현재 날짜: ${stats.currentDate}`);

  if (stats.totalFiles > 0) {
    console.log(`\n가장 오래된 파일: ${stats.oldestFile}`);
    console.log(`  생성: ${stats.oldestDate}`);
    console.log(`\n가장 최근 파일: ${stats.newestFile}`);
    console.log(`  생성: ${stats.newestDate}`);
  } else {
    console.log('\n로그 파일을 찾을 수 없습니다');
  }
  console.log('');
}

// 정리 전 통계
console.log('정리 전:');
const statsBefore = cleaner.getStats();
displayStats(statsBefore);

// 수동으로 정리 트리거
console.log('수동 정리 실행 중...\n');
const result = cleaner.cleanup();

if (result.error) {
  console.error('정리 실패:', result.error);
} else {
  console.log('정리 결과:');
  console.log('================');
  console.log(`삭제된 파일: ${result.deletedCount}`);

  if (result.deletedCount > 0) {
    console.log('\n삭제된 파일 목록:');
    result.deletedFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
  } else {
    console.log('삭제할 오래된 파일 없음');
  }
  console.log('');
}

// 정리 후 통계
console.log('정리 후:');
const statsAfter = cleaner.getStats();
displayStats(statsAfter);

// 절약된 공간 계산
if (!statsBefore.error && !statsAfter.error) {
  const spaceSaved = statsBefore.totalSize - statsAfter.totalSize;
  const filesSaved = statsBefore.totalFiles - statsAfter.totalFiles;

  console.log('정리 요약:');
  console.log('================');
  console.log(`제거된 파일: ${filesSaved}`);
  console.log(`확보된 공간: ${(spaceSaved / 1024 / 1024).toFixed(2)} MB`);
}

// 애플리케이션 종료 시 정리
process.on('exit', () => {
  console.log('\n애플리케이션 종료 중...');
  const finalCleanup = cleaner.cleanup();
  console.log(`최종 정리: ${finalCleanup.deletedCount}개 파일 제거됨`);
});
```

### 주요 사용 사례

#### 주기적인 정리 체크

```javascript
// 매시간 통계 체크
setInterval(
  () => {
    const stats = cleaner.getStats();
    const sizeMB = stats.totalSize / 1024 / 1024;

    if (sizeMB > 100) {
      // 100MB 초과
      console.log(`로그 크기가 큽니다: ${sizeMB.toFixed(2)} MB`);
      cleaner.cleanup();
    }
  },
  60 * 60 * 1000
);
```

#### 디스크 공간 모니터링

```javascript
function checkDiskSpace() {
  const stats = cleaner.getStats();
  const sizeMB = stats.totalSize / 1024 / 1024;

  return {
    usage: sizeMB,
    files: stats.totalFiles,
    needsCleanup: sizeMB > 50,
  };
}
```

---

## 에러 처리

에러를 적절히 처리하는 프로덕션 레벨 예제입니다.

### 예제 코드

```javascript
const log = require('electron-log/main');
const cleaner = require('electron-log-cleaner');

console.log('에러 처리 예제\n');

// 예제 1: 유효하지 않은 옵션 처리
console.log('1. 유효하지 않은 옵션 테스트...');
try {
  cleaner.setup({
    maxAge: -1, // 유효하지 않음: 0보다 커야 함
  });
} catch (error) {
  console.error('예상된 에러:', error.message);
}

try {
  cleaner.setup({
    maxAge: 'invalid', // 유효하지 않음: 숫자여야 함
  });
} catch (error) {
  console.error('예상된 에러:', error.message);
}

try {
  cleaner.setup({}); // 유효하지 않음: maxAge 필수
} catch (error) {
  console.error('예상된 에러:', error.message);
}
console.log('');

// 예제 2: 에러 콜백이 있는 유효한 설정
console.log('2. 에러 콜백으로 설정...');
let errorCount = 0;

cleaner.setup({
  maxAge: 30,
  electronLog: log,
  onError: (error) => {
    errorCount++;
    console.error(`에러 #${errorCount}:`, error.message);

    // 파일에 로그
    log.error('로그 cleaner 에러:', error);

    // 다음도 가능합니다:
    // - 에러 모니터링 서비스로 전송 (Sentry, Bugsnag 등)
    // - 사용자 알림 표시
    // - 재시도 로직 구현
    // - 대체 동작으로 폴백

    // 예: 모니터링 서비스로 전송
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, {
    //     tags: {
    //       component: 'log-cleaner'
    //     }
    //   });
    // }
  },
});

console.log('에러 처리와 함께 Cleaner 초기화됨\n');

// 예제 3: 정리 에러를 우아하게 처리
console.log('3. 정리 에러 처리 테스트...');
const result = cleaner.cleanup();

if (result.error) {
  console.error('정리 실패:', result.error);
  console.log('정리 실패에도 애플리케이션은 계속 실행됩니다');
} else {
  console.log(`정리 성공: ${result.deletedCount}개 파일 삭제됨`);
}
console.log('');

// 예제 4: 통계 에러를 우아하게 처리
console.log('4. 통계 에러 처리 테스트...');
const stats = cleaner.getStats();

if (stats.error) {
  console.error('통계 조회 실패:', stats.error);
  console.log('기본/폴백 값 사용');
} else {
  console.log(`통계 조회됨: ${stats.totalFiles}개 파일`);
}
console.log('');

// 예제 5: 프로덕션용 종합 에러 처리
console.log('5. 프로덕션 레벨 에러 처리 설정...');

function setupProductionCleaner() {
  try {
    cleaner.setup({
      maxAge: process.env.LOG_RETENTION_DAYS || 30,
      electronLog: log,
      fileTransport: {
        maxSize: 10 * 1024 * 1024,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      },
      onError: (error) => {
        // 에러 로깅
        log.error('로그 cleaner 에러:', {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });

        // 프로덕션에서 모니터링 서비스로 전송
        if (process.env.NODE_ENV === 'production') {
          // sendToMonitoring(error);
        }

        // 애플리케이션을 중단시키지 않음
        console.error('로그 cleaner에서 에러가 발생했지만 애플리케이션은 계속됩니다');
      },
    });

    log.info('로그 cleaner 초기화 성공');
    return true;
  } catch (error) {
    // 심각한 설정 에러 - 우아하게 로그하고 처리
    console.error('로그 cleaner 초기화 실패:', error.message);
    log.error('로그 cleaner 초기화 실패:', error);

    // 로그 정리 없이도 애플리케이션은 계속 실행 가능
    console.log('자동 로그 정리 없이 애플리케이션이 계속됩니다');
    return false;
  }
}

const cleanerInitialized = setupProductionCleaner();

if (cleanerInitialized) {
  console.log('로그 cleaner 활성화됨');
} else {
  console.log('초기화 실패로 로그 cleaner 비활성화됨');
}

console.log('\n에러 처리 모범 사례:');
console.log('- 설정 전에 항상 옵션 유효성 검사');
console.log('- setup() 호출에 try-catch 사용');
console.log('- 런타임 에러를 위한 onError 콜백 구현');
console.log('- result.error 및 stats.error 속성 확인');
console.log('- 로그 cleaner 에러가 앱을 중단시키지 않도록');
console.log('- 에러 로깅하되 애플리케이션 실행은 계속');
```

### 에러 처리 패턴

#### 1. 기본 Try-Catch

```javascript
try {
  cleaner.setup({ maxAge: 30 });
} catch (error) {
  console.error('설정 실패:', error.message);
  // 로그 정리 없이 계속
}
```

#### 2. 런타임 에러 콜백

```javascript
cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    log.error('런타임 에러:', error);
    // 모니터링 서비스로 전송하지만 계속 진행
  },
});
```

#### 3. 정리 결과 확인

```javascript
const result = cleaner.cleanup();
if (result.error) {
  log.warn('정리 건너뜀:', result.error);
} else {
  log.info(`${result.deletedCount}개 파일 정리됨`);
}
```

---

## 고급 패턴

### 환경 변수 설정

```javascript
// .env 파일
// LOG_RETENTION_DAYS=30
// LOG_MAX_SIZE=10485760
// LOG_LEVEL=info

cleaner.setup({
  maxAge: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
  fileTransport: {
    maxSize: parseInt(process.env.LOG_MAX_SIZE) || 10 * 1024 * 1024,
    level: process.env.LOG_LEVEL || 'info',
  },
});
```

### 모니터링 통합

```javascript
// Sentry와 함께
cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    Sentry.captureException(error, {
      tags: { component: 'log-cleaner' },
      level: 'warning',
    });
  },
});

// 커스텀 모니터링
cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    monitoring.logError({
      service: 'electron-log-cleaner',
      error: error.message,
      stack: error.stack,
      timestamp: Date.now(),
    });
  },
});
```

### 주기적인 통계 보고

```javascript
// 매시간 통계 보고
setInterval(
  () => {
    const stats = cleaner.getStats();

    log.info('로그 통계', {
      files: stats.totalFiles,
      sizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
      oldestFile: stats.oldestFile,
      directory: stats.logDir,
    });
  },
  60 * 60 * 1000
);
```

### 조건부 정리

```javascript
function conditionalCleanup() {
  const stats = cleaner.getStats();
  const sizeMB = stats.totalSize / 1024 / 1024;

  // 50MB 이상이거나 파일이 100개 이상이면 정리
  if (sizeMB > 50 || stats.totalFiles > 100) {
    const result = cleaner.cleanup();
    log.info(`조건부 정리: ${result.deletedCount}개 파일 제거됨`);
  }
}

// 매일 체크
setInterval(conditionalCleanup, 24 * 60 * 60 * 1000);
```

---

## 예제 실행

저장소의 `examples/` 디렉토리에는 실행 가능한 예제가 있습니다:

```bash
# 기본 사용법
node examples/basic-usage.js

# 커스텀 설정
node examples/custom-config.js

# 수동 정리
node examples/manual-cleanup.js

# 에러 처리
node examples/error-handling.js

# Electron 통합 (electron 필요)
npm install electron --save-dev
node examples/with-electron.js
```

---

## 다음 단계

- [API 레퍼런스](./api.md) - 상세한 API 문서
- [메인 README](./README.md) - 프로젝트 개요
- [GitHub 저장소](https://github.com/Sorin0404/electron-log-cleaner) - 소스 코드 및 이슈

---

## 도움이 필요하신가요?

- 기존 [이슈](https://github.com/Sorin0404/electron-log-cleaner/issues) 확인
- 새로운 [이슈 생성](https://github.com/Sorin0404/electron-log-cleaner/issues/new)
- [기여 가이드](../../CONTRIBUTING.md) 참조
