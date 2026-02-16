[English](README.md) | **한국어**

# dynadot-mcp

[Dynadot](https://www.dynadot.com) 도메인 등록대행업체 API를 위한 MCP (Model Context Protocol) 서버입니다. AI 어시스턴트에서 도메인, DNS 레코드, 연락처, 이전 등을 관리할 수 있습니다.

## 기능

- Dynadot API3 전체를 커버하는 **35개 이상의 도구**
- 도메인 검색, 등록, 갱신, 삭제
- DNS 레코드 관리 (A, AAAA, CNAME, MX, TXT, SRV)
- 네임서버 구성 및 DNSSEC
- 연락처 CRUD 작업
- 도메인 이전 (in/out)
- WHOIS 프라이버시, 포워딩, 잠금
- 폴더 구성
- 마켓플레이스: 경매, 백오더, 리스팅
- 계정 정보 및 잔액 리소스
- 테스트용 샌드박스 모드

## 설치

```bash
npm install -g dynadot-mcp
```

또는 직접 실행:

```bash
npx dynadot-mcp
```

## 구성

다음 환경변수를 설정하세요:

| 변수 | 필수 여부 | 설명 |
|------|----------|------|
| `DYNADOT_API_KEY` | 필수 | Dynadot API 키 ([여기서 발급](https://www.dynadot.com/account/domain/setting/api.html)) |
| `DYNADOT_SANDBOX` | 선택 | 샌드박스 API 사용 시 `true`로 설정 (기본값: `false`) |

## Claude Code에서 사용하기

Claude Code MCP 설정 파일(`~/.claude/settings.json` 또는 프로젝트 `.claude/settings.json`)에 추가:

```json
{
  "mcpServers": {
    "dynadot": {
      "command": "npx",
      "args": ["-y", "dynadot-mcp"],
      "env": {
        "DYNADOT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Claude Desktop에서 사용하기

Claude Desktop 설정 파일(`~/Library/Application Support/Claude/claude_desktop_config.json`)에 추가:

```json
{
  "mcpServers": {
    "dynadot": {
      "command": "npx",
      "args": ["-y", "dynadot-mcp"],
      "env": {
        "DYNADOT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## 사용 가능한 도구

### 도메인 관리
| 도구 | 설명 |
|------|------|
| `search_domain` | 도메인 사용 가능 여부 확인 (최대 100개 동시 조회) |
| `register_domain` | 새 도메인 등록 |
| `bulk_register_domains` | 여러 도메인 한 번에 등록 |
| `get_domain_info` | 도메인 상세 정보 조회 |
| `list_domains` | 계정의 모든 도메인 목록 조회 |
| `renew_domain` | 도메인 갱신 |
| `delete_domain` | 도메인 삭제 (유예 기간) |

### DNS
| 도구 | 설명 |
|------|------|
| `get_dns` | 도메인의 DNS 레코드 조회 |
| `set_dns` | DNS 레코드 설정 (A, AAAA, CNAME, MX, TXT 등) |
| `set_nameservers` | 네임서버 구성 (최대 13개) |
| `get_nameservers` | 현재 네임서버 조회 |
| `register_nameserver` | 커스텀 네임서버 등록 |
| `get_dnssec` | DNSSEC 설정 조회 |
| `set_dnssec` | DNSSEC 설정 또는 해제 |

### 연락처
| 도구 | 설명 |
|------|------|
| `create_contact` | 새 연락처 생성 |
| `edit_contact` | 기존 연락처 수정 |
| `delete_contact` | 연락처 삭제 |
| `list_contacts` | 모든 연락처 목록 조회 또는 상세 정보 확인 |

### 이전
| 도구 | 설명 |
|------|------|
| `transfer_domain` | 도메인 이전 시작 |
| `cancel_transfer` | 대기 중인 이전 취소 |
| `get_transfer_status` | 이전 상태 확인 |
| `get_auth_code` | 이전 인증/EPP 코드 조회 |
| `authorize_transfer_away` | 아웃고잉 이전 승인 |

### 설정
| 도구 | 설명 |
|------|------|
| `set_privacy` | WHOIS 프라이버시 설정 (전체/부분/해제) |
| `set_whois_contacts` | WHOIS 연락처 설정 |
| `set_forwarding` | URL/스텔스 포워딩 설정 |
| `set_renew_option` | 자동 갱신 옵션 설정 |
| `lock_domain` | 이전 보호를 위한 도메인 잠금 |
| `set_domain_note` | 도메인 메모 및 폴더 설정 |

### 폴더
| 도구 | 설명 |
|------|------|
| `create_folder` | 새 폴더 생성 |
| `delete_folder` | 폴더 삭제 |
| `list_folders` | 모든 폴더 목록 조회 |
| `set_folder_settings` | 폴더에 기본 설정 적용 |

### 계정
| 도구 | 설명 |
|------|------|
| `get_account_info` | 계정 정보 조회 |
| `get_account_balance` | 계정 잔액 확인 |
| `set_account_defaults` | 기본 계정 설정 지정 |

### 마켓플레이스
| 도구 | 설명 |
|------|------|
| `get_auctions` | 진행 중/종료된 경매 목록 조회 |
| `place_bid` | 경매에 입찰 |
| `manage_backorders` | 백오더 요청 추가/삭제/목록 조회 |
| `set_for_sale` | 판매용 도메인 리스팅 |
| `get_marketplace_listings` | 마켓플레이스 리스팅 조회 |

## 리소스

| URI | 설명 |
|-----|------|
| `dynadot://account` | 계정 정보 스냅샷 |
| `dynadot://balance` | 현재 계정 잔액 |
| `dynadot://domains` | 전체 도메인 목록 |

## 개발

```bash
git clone https://github.com/mikusnuz/dynadot-mcp.git
cd dynadot-mcp
npm install
npm run dev
```

## 라이선스

MIT
