# electron-log-cleaner

[![CI](https://github.com/Sorin0404/electron-log-cleaner/workflows/CI/badge.svg)](https://github.com/Sorin0404/electron-log-cleaner/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/electron-log-cleaner.svg)](https://www.npmjs.com/package/electron-log-cleaner)
[![npm downloads](https://img.shields.io/npm/dm/electron-log-cleaner.svg)](https://www.npmjs.com/package/electron-log-cleaner)
[![codecov](https://codecov.io/gh/Sorin0404/electron-log-cleaner/branch/main/graph/badge.svg)](https://codecov.io/gh/Sorin0404/electron-log-cleaner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/electron-log-cleaner.svg)](https://nodejs.org)

**언어**: [English](../../README.md) | 한국어

electron-log의 자동 로그 파일 회전 및 정리 유틸리티입니다. 날짜별로 로그 파일을 관리하고, 자정에 자동으로 회전하며, 설정 가능한 보관 기간에 따라 오래된 로그를 제거합니다.

## 주요 기능

- **자동 로그 회전**: 매일 자정에 날짜 기반 파일명으로 로그 파일 자동 회전 (예: `app-20260106.log`)
- **오래된 로그 정리**: 지정된 일수보다 오래된 로그 파일 자동 삭제
- **설정 가능**: 파일 전송 설정 사용자 정의 (maxSize, format, level)
- **TypeScript 지원**: 완전한 TypeScript 타입 정의 포함
- **통계 제공**: 로그 파일에 대한 상세 정보 제공 (크기, 개수, 날짜)
- **에러 처리**: 실패를 우아하게 처리하는 선택적 에러 콜백

## 설치

npm 사용:

```bash
npm install electron-log-cleaner
```

yarn 사용:

```bash
yarn add electron-log-cleaner
```

pnpm 사용:

```bash
pnpm add electron-log-cleaner
```

## 빠른 시작

### 기본 사용법 (ESM)

```javascript
import cleaner from 'electron-log-cleaner';

// 최소 설정으로 설정
cleaner.setup({
  maxAge: 30, // 30일간 로그 보관
});
```

### 기본 사용법 (CommonJS)

```javascript
const cleaner = require('electron-log-cleaner');

// 최소 설정으로 설정
cleaner.setup({
  maxAge: 30, // 30일간 로그 보관
});
```

### electron-log 통합

```javascript
import log from 'electron-log/main';
import cleaner from 'electron-log-cleaner';

// electron-log 인스턴스와 함께 cleaner 설정
cleaner.setup({
  maxAge: 30,
  electronLog: log,
});

// electron-log를 평소처럼 사용
log.info('애플리케이션 시작됨');
```

## 설정 옵션

### CleanerOptions

```typescript
interface CleanerOptions {
  maxAge: number; // 필수: 로그 파일의 최대 보관 일수
  electronLog?: ElectronLog; // 선택: electron-log 인스턴스 (제공하지 않으면 자동 감지)
  fileTransport?: FileTransportOptions; // 선택: 파일 전송 설정
  onError?: (error: Error) => void; // 선택: 에러 콜백
}
```

### FileTransportOptions

```typescript
interface FileTransportOptions {
  maxSize?: number; // 단일 로그 파일의 최대 크기 (바이트)
  format?: string; // 로그 형식 문자열 (예: '[{y}-{m}-{d}] {text}')
  level?: string | false; // 최소 로그 레벨: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly' | false
}
```

## API 레퍼런스

### setup(options)

설정 옵션으로 로그 cleaner를 초기화합니다.

```javascript
cleaner.setup({
  maxAge: 30,
  electronLog: log,
  fileTransport: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}',
    level: 'info',
  },
  onError: (error) => {
    console.error('Cleaner 에러:', error);
  },
});
```

**에러 발생**: 옵션이 유효하지 않거나 설정에 실패하면 에러 발생

### cleanup()

수동으로 오래된 로그 파일 정리를 트리거합니다.

```javascript
const result = cleaner.cleanup();
console.log(`${result.deletedCount}개 파일 삭제됨`);
console.log('삭제된 파일:', result.deletedFiles);
```

**반환값**: `CleanupResult`

```typescript
interface CleanupResult {
  deletedCount: number; // 삭제된 파일 개수
  deletedFiles: string[]; // 삭제된 파일명 배열
  error?: string; // 정리 실패 시 에러 메시지
}
```

### getStats()

로그 파일에 대한 통계를 가져옵니다.

```javascript
const stats = cleaner.getStats();
console.log(`전체 파일: ${stats.totalFiles}`);
console.log(`전체 크기: ${stats.totalSize} 바이트`);
console.log(`가장 오래된 파일: ${stats.oldestFile} (${stats.oldestDate})`);
console.log(`가장 최근 파일: ${stats.newestFile} (${stats.newestDate})`);
```

**반환값**: `CleanupStats`

```typescript
interface CleanupStats {
  totalFiles: number; // 전체 로그 파일 개수
  totalSize: number; // 모든 로그 파일의 전체 크기 (바이트)
  oldestFile: string | null; // 가장 오래된 로그 파일명
  oldestDate: string | null; // 가장 오래된 로그 파일 날짜 (YYYY-MM-DD HH:mm:ss)
  newestFile: string | null; // 가장 최근 로그 파일명
  newestDate: string | null; // 가장 최근 로그 파일 날짜 (YYYY-MM-DD HH:mm:ss)
  logDir: string; // 로그 디렉토리 경로
  currentDate: string; // 현재 날짜 (YYYYMMDD 형식)
  error?: string; // 통계 조회 실패 시 에러 메시지
}
```

## 사용 예제

### 예제 1: 기본 설정

```javascript
import cleaner from 'electron-log-cleaner';

cleaner.setup({
  maxAge: 30, // 30일간 로그 보관
});
```

### 예제 2: 커스텀 파일 전송 설정

```javascript
import log from 'electron-log/main';
import cleaner from 'electron-log-cleaner';

cleaner.setup({
  maxAge: 7, // 7일간 로그 보관
  electronLog: log,
  fileTransport: {
    maxSize: 5 * 1024 * 1024, // 파일당 5 MB
    format: '[{y}-{m}-{d} {h}:{i}:{s}] {text}',
    level: 'info',
  },
});
```

### 예제 3: 에러 처리

```javascript
import cleaner from 'electron-log-cleaner';

cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    console.error('로그 cleaner 에러:', error);
    // 모니터링 서비스로 에러 전송
  },
});
```

### 예제 4: 수동 정리 및 통계

```javascript
import cleaner from 'electron-log-cleaner';

cleaner.setup({ maxAge: 30 });

// 정리 전 통계
const statsBefore = cleaner.getStats();
console.log('정리 전:', statsBefore);

// 수동으로 정리 트리거
const result = cleaner.cleanup();
console.log(`${result.deletedCount}개의 오래된 로그 파일 삭제됨`);

// 정리 후 통계
const statsAfter = cleaner.getStats();
console.log('정리 후:', statsAfter);
```

### 예제 5: Electron 메인 프로세스 통합

```javascript
import { app } from 'electron';
import log from 'electron-log/main';
import cleaner from 'electron-log-cleaner';

app.whenReady().then(() => {
  // 로그 cleaner 설정
  cleaner.setup({
    maxAge: 30,
    electronLog: log,
    fileTransport: {
      maxSize: 10 * 1024 * 1024,
      level: 'info',
    },
    onError: (error) => {
      log.error('로그 cleaner 에러:', error);
    },
  });

  log.info('애플리케이션 시작됨');
});
```

## 작동 방식

1. **설정**: `setup()` 호출 시 cleaner는:
   - 설정 옵션 유효성 검사
   - 현재 날짜를 포함하도록 electron-log 파일명 업데이트
   - 오래된 로그 파일 초기 정리 수행
   - 자정 자동 회전 스케줄링
   - 최종 정리를 위한 앱 종료 핸들러 등록

2. **자동 회전**: 매일 자정마다:
   - 새 날짜로 로그 파일명 업데이트
   - 오래된 파일 제거를 위한 정리 트리거
   - 다음 자정 체크 스케줄링

3. **정리**: 정리 중:
   - 날짜가 포함된 로그 파일 스캔 (예: `app-YYYYMMDD.log`)
   - 수정 시간 기준으로 `.old.log` 파일 확인
   - `maxAge`일보다 오래된 파일 삭제
   - 현재 로그 파일 보존
   - 삭제된 파일에 대한 통계 반환

## 더 많은 예제

더 자세한 사용 예제는 다음 문서를 참고하세요:

- [예제 가이드](./examples.md) - 5가지 실용적인 사용 예제
- [API 문서](./api.md) - 상세한 API 레퍼런스

## 테스트

커버리지와 함께 테스트 실행:

```bash
npm test
npm run test:coverage
```

## 요구사항

- Node.js >= 16.0.0
- electron-log >= 5.0.0 (peer dependency)

## 라이센스

MIT License - 자세한 내용은 [LICENSE](../../LICENSE) 파일 참조

## 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

자세한 내용은 [기여 가이드](../../CONTRIBUTING.md)를 참조하세요.

## 지원

문제가 발생하거나 질문이 있으시면 [GitHub 이슈](https://github.com/Sorin0404/electron-log-cleaner/issues)를 등록해주세요.
