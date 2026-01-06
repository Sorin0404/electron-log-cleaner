# API 레퍼런스

**언어**: [English](../api.md) | 한국어

electron-log-cleaner의 전체 API 문서입니다.

## 목차

- [CleanerOptions](#cleaneroptions)
- [FileTransportOptions](#filetransportoptions)
- [CleanupResult](#cleanupresult)
- [CleanupStats](#cleanupstats)
- [메소드](#메소드)
  - [setup()](#setupoptions)
  - [cleanup()](#cleanup)
  - [getStats()](#getstats)

---

## 인터페이스

### CleanerOptions

로그 cleaner 설정을 위한 옵션입니다.

```typescript
interface CleanerOptions {
  maxAge: number;
  electronLog?: ElectronLog;
  fileTransport?: FileTransportOptions;
  onError?: (error: Error) => void;
}
```

#### 속성

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `maxAge` | `number` | ✓ | 로그 파일의 최대 보관 일수. 이 일수보다 오래된 파일은 삭제됩니다. |
| `electronLog` | `ElectronLog` | ✗ | electron-log 인스턴스. 제공하지 않으면 자동으로 감지를 시도합니다. |
| `fileTransport` | `FileTransportOptions` | ✗ | electron-log에 적용할 파일 전송 옵션 |
| `onError` | `(error: Error) => void` | ✗ | 정리 중 에러 발생 시 호출되는 콜백 함수 |

#### 예제

```javascript
const options = {
  maxAge: 30,
  electronLog: log,
  fileTransport: {
    maxSize: 10 * 1024 * 1024,
    level: 'info'
  },
  onError: (error) => {
    console.error('에러 발생:', error);
  }
};

cleaner.setup(options);
```

---

### FileTransportOptions

electron-log 파일 전송 설정 옵션입니다.

```typescript
interface FileTransportOptions {
  maxSize?: number;
  format?: string;
  level?: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly' | false;
}
```

#### 속성

| 이름 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `maxSize` | `number` | - | 단일 로그 파일의 최대 크기 (바이트) |
| `format` | `string` | - | 로그 형식 문자열 (예: `'[{y}-{m}-{d}] {text}'`) |
| `level` | `string \| false` | - | 파일에 기록할 최소 로그 레벨 |

#### 로그 레벨

사용 가능한 로그 레벨 (우선순위 높은 순):
- `'error'` - 에러만
- `'warn'` - 경고 이상
- `'info'` - 정보 이상 (권장)
- `'verbose'` - 상세 로그 포함
- `'debug'` - 디버그 로그 포함
- `'silly'` - 모든 로그
- `false` - 로그 비활성화

#### 형식 문자열 변수

| 변수 | 설명 |
|------|------|
| `{y}` | 연도 (4자리) |
| `{m}` | 월 (2자리) |
| `{d}` | 일 (2자리) |
| `{h}` | 시 (2자리) |
| `{i}` | 분 (2자리) |
| `{s}` | 초 (2자리) |
| `{ms}` | 밀리초 (3자리) |
| `{level}` | 로그 레벨 |
| `{text}` | 로그 메시지 |

#### 예제

```javascript
const fileTransport = {
  maxSize: 5 * 1024 * 1024,  // 5MB
  format: '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}',
  level: 'info'
};

cleaner.setup({
  maxAge: 30,
  fileTransport
});
```

---

### CleanupResult

정리 작업의 결과입니다.

```typescript
interface CleanupResult {
  deletedCount: number;
  deletedFiles: string[];
  error?: string;
}
```

#### 속성

| 이름 | 타입 | 설명 |
|------|------|------|
| `deletedCount` | `number` | 삭제된 파일 개수 |
| `deletedFiles` | `string[]` | 삭제된 파일명 배열 |
| `error` | `string` | 정리 실패 시 에러 메시지 (선택) |

#### 예제

```javascript
const result = cleaner.cleanup();

if (result.error) {
  console.error('정리 실패:', result.error);
} else {
  console.log(`${result.deletedCount}개 파일 삭제됨`);
  result.deletedFiles.forEach(file => {
    console.log(`- ${file}`);
  });
}
```

---

### CleanupStats

로그 파일 통계 정보입니다.

```typescript
interface CleanupStats {
  totalFiles: number;
  totalSize: number;
  oldestFile: string | null;
  oldestDate: string | null;
  newestFile: string | null;
  newestDate: string | null;
  logDir: string;
  currentDate: string;
  error?: string;
}
```

#### 속성

| 이름 | 타입 | 설명 |
|------|------|------|
| `totalFiles` | `number` | 전체 로그 파일 개수 |
| `totalSize` | `number` | 모든 로그 파일의 전체 크기 (바이트) |
| `oldestFile` | `string \| null` | 가장 오래된 로그 파일명 |
| `oldestDate` | `string \| null` | 가장 오래된 로그 파일 날짜 (YYYY-MM-DD HH:mm:ss) |
| `newestFile` | `string \| null` | 가장 최근 로그 파일명 |
| `newestDate` | `string \| null` | 가장 최근 로그 파일 날짜 (YYYY-MM-DD HH:mm:ss) |
| `logDir` | `string` | 로그 디렉토리 경로 |
| `currentDate` | `string` | 현재 날짜 (YYYYMMDD 형식) |
| `error` | `string` | 통계 조회 실패 시 에러 메시지 (선택) |

#### 예제

```javascript
const stats = cleaner.getStats();

if (stats.error) {
  console.error('통계 조회 실패:', stats.error);
} else {
  console.log(`전체 파일: ${stats.totalFiles}`);
  console.log(`전체 크기: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`디렉토리: ${stats.logDir}`);

  if (stats.oldestFile) {
    console.log(`가장 오래된 파일: ${stats.oldestFile}`);
    console.log(`날짜: ${stats.oldestDate}`);
  }
}
```

---

## 메소드

### setup(options)

설정 옵션으로 로그 cleaner를 초기화합니다.

```typescript
setup(options: CleanerOptions): void
```

#### 파라미터

- `options` ([CleanerOptions](#cleaneroptions)) - 설정 옵션

#### 에러

다음의 경우 에러를 발생시킵니다:
- `options`가 객체가 아닌 경우
- `maxAge`가 제공되지 않거나 숫자가 아닌 경우
- `maxAge`가 0 이하인 경우
- `fileTransport`가 객체가 아닌 경우
- `onError`가 함수가 아닌 경우
- electron-log를 찾을 수 없고 `electronLog` 옵션도 제공되지 않은 경우

#### 동작

1. 옵션 유효성 검사
2. electron-log 인스턴스 가져오기 또는 자동 감지
3. 로그 디렉토리 경로 결정
4. 파일 전송 옵션 적용 (제공된 경우)
5. 현재 날짜로 로그 파일명 업데이트
6. 초기 정리 수행
7. 자정 회전 스케줄링
8. 앱 종료 핸들러 등록

#### 예제

**기본 설정:**
```javascript
cleaner.setup({
  maxAge: 30
});
```

**전체 설정:**
```javascript
cleaner.setup({
  maxAge: 30,
  electronLog: log,
  fileTransport: {
    maxSize: 10 * 1024 * 1024,
    format: '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}',
    level: 'info'
  },
  onError: (error) => {
    console.error('로그 cleaner 에러:', error);
    // 모니터링 서비스로 전송
    Sentry.captureException(error);
  }
});
```

**에러 처리:**
```javascript
try {
  cleaner.setup({
    maxAge: 30
  });
  console.log('로그 cleaner 초기화 성공');
} catch (error) {
  console.error('초기화 실패:', error.message);
}
```

---

### cleanup()

수동으로 오래된 로그 파일 정리를 트리거합니다.

```typescript
cleanup(): CleanupResult
```

#### 반환값

- ([CleanupResult](#cleanupresult)) - 정리 결과 (삭제된 파일 정보 포함)

#### 동작

1. 로그 디렉토리의 모든 파일 스캔
2. 각 파일에 대해:
   - 현재 로그 파일이면 건너뛰기
   - 날짜 기반 파일(`app-YYYYMMDD.log`)인 경우 날짜에서 나이 계산
   - `.old.log` 파일인 경우 수정 시간에서 나이 계산
   - `maxAge`보다 오래되었으면 삭제
3. 삭제된 파일 통계 반환

#### 예제

**기본 사용:**
```javascript
const result = cleaner.cleanup();
console.log(`${result.deletedCount}개 파일 삭제됨`);
```

**상세 정보:**
```javascript
const result = cleaner.cleanup();

if (result.error) {
  console.error('정리 실패:', result.error);
} else if (result.deletedCount === 0) {
  console.log('삭제할 오래된 파일 없음');
} else {
  console.log(`${result.deletedCount}개 파일 삭제됨:`);
  result.deletedFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
}
```

**스케줄링된 정리:**
```javascript
// 매주 일요일 자정에 정리 (자동 자정 정리에 추가)
setInterval(() => {
  const now = new Date();
  if (now.getDay() === 0 && now.getHours() === 0) {
    const result = cleaner.cleanup();
    console.log(`주간 정리: ${result.deletedCount}개 파일 삭제됨`);
  }
}, 60 * 60 * 1000); // 매시간 체크
```

---

### getStats()

로그 파일에 대한 통계를 가져옵니다.

```typescript
getStats(): CleanupStats
```

#### 반환값

- ([CleanupStats](#cleanupstats)) - 로그 파일 통계

#### 동작

1. 로그 디렉토리의 모든 `.log` 파일 스캔
2. 각 파일에 대해:
   - 파일 크기 수집
   - 수정 시간 기록
3. 통계 계산:
   - 전체 파일 개수
   - 전체 크기 (바이트)
   - 가장 오래된/최근 파일 및 날짜
4. 통계 객체 반환

#### 예제

**기본 사용:**
```javascript
const stats = cleaner.getStats();
console.log(`전체 파일: ${stats.totalFiles}`);
console.log(`전체 크기: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
```

**상세 정보:**
```javascript
function displayStats() {
  const stats = cleaner.getStats();

  if (stats.error) {
    console.error('통계 조회 실패:', stats.error);
    return;
  }

  console.log('=== 로그 파일 통계 ===');
  console.log(`디렉토리: ${stats.logDir}`);
  console.log(`현재 날짜: ${stats.currentDate}`);
  console.log(`전체 파일: ${stats.totalFiles}`);
  console.log(`전체 크기: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);

  if (stats.totalFiles > 0) {
    console.log(`\n가장 오래된 파일: ${stats.oldestFile}`);
    console.log(`생성 날짜: ${stats.oldestDate}`);
    console.log(`\n가장 최근 파일: ${stats.newestFile}`);
    console.log(`생성 날짜: ${stats.newestDate}`);
  }
}

displayStats();
```

**정리 전후 비교:**
```javascript
const before = cleaner.getStats();
console.log('정리 전:', before.totalFiles, '파일,', (before.totalSize / 1024 / 1024).toFixed(2), 'MB');

cleaner.cleanup();

const after = cleaner.getStats();
console.log('정리 후:', after.totalFiles, '파일,', (after.totalSize / 1024 / 1024).toFixed(2), 'MB');

const saved = before.totalSize - after.totalSize;
console.log('절약된 공간:', (saved / 1024 / 1024).toFixed(2), 'MB');
```

**모니터링 대시보드:**
```javascript
// 매시간 통계 로깅
setInterval(() => {
  const stats = cleaner.getStats();
  log.info('로그 통계', {
    files: stats.totalFiles,
    sizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
    oldestFile: stats.oldestFile
  });
}, 60 * 60 * 1000);
```

---

## 에러 처리

### 설정 에러

`setup()` 호출 시 발생할 수 있는 에러:

```javascript
try {
  cleaner.setup(options);
} catch (error) {
  if (error.message.includes('Options must be an object')) {
    // 유효하지 않은 옵션 타입
  } else if (error.message.includes('maxAge is required')) {
    // maxAge 누락
  } else if (error.message.includes('greater than 0')) {
    // maxAge가 0 이하
  } else if (error.message.includes('electron-log not found')) {
    // electron-log를 찾을 수 없음
  }
}
```

### 런타임 에러

`onError` 콜백으로 런타임 에러 처리:

```javascript
cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    // 에러 로깅
    console.error('[로그 Cleaner 에러]', error);

    // 에러 분류
    if (error.code === 'ENOENT') {
      console.log('로그 디렉토리를 찾을 수 없음');
    } else if (error.code === 'EACCES') {
      console.log('로그 파일 접근 권한 없음');
    }

    // 모니터링 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    }
  }
});
```

### 정리 에러

```javascript
const result = cleaner.cleanup();

if (result.error) {
  console.error('정리 중 에러 발생:', result.error);
  // 앱은 계속 실행됨 - 정리 실패가 앱을 중단시키지 않음
}
```

### 통계 에러

```javascript
const stats = cleaner.getStats();

if (stats.error) {
  console.error('통계 조회 실패:', stats.error);
  // 기본값 사용
  console.log('기본 통계 사용');
}
```

---

## 모범 사례

### 1. 항상 에러 처리 구현

```javascript
cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    log.error('로그 cleaner 에러:', error);
  }
});
```

### 2. 환경별 다른 설정 사용

```javascript
const isDev = process.env.NODE_ENV === 'development';

cleaner.setup({
  maxAge: isDev ? 7 : 30,
  fileTransport: {
    level: isDev ? 'debug' : 'info'
  }
});
```

### 3. 디스크 공간 모니터링

```javascript
setInterval(() => {
  const stats = cleaner.getStats();
  const sizeMB = stats.totalSize / 1024 / 1024;

  if (sizeMB > 100) { // 100MB 이상
    log.warn('로그 크기가 큽니다:', sizeMB.toFixed(2), 'MB');
    cleaner.cleanup();
  }
}, 60 * 60 * 1000); // 매시간
```

### 4. Try-Catch로 설정 감싸기

```javascript
try {
  cleaner.setup({ maxAge: 30 });
} catch (error) {
  console.error('로그 cleaner 초기화 실패:', error);
  // 앱은 로그 정리 없이 계속 실행
}
```

---

## 참고

- [메인 README](./README.md)
- [사용 예제](./examples.md)
- [GitHub 저장소](https://github.com/Sorin0404/electron-log-cleaner)
