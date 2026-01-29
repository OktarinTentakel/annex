#!/bin/bash
set -euo pipefail

SOURCE=""
PASSTHROUGH=()

while [[ $# -gt 0 ]]; do
	case "$1" in
		--source=*)
			SOURCE="${1#*=}"
			shift
			;;
		--source)
			shift
			SOURCE="${1:-}"
			[[ $# -gt 0 ]] && shift || true
			;;
		*)
			PASSTHROUGH+=("$1")
			shift
			;;
	esac
done

TASK="test"
case "${SOURCE}" in
	""|"source")		TASK="test" ;;
	"dist")				TASK="test-dist" ;;
	"es5-monolith")		TASK="test-es5-monolith" ;;
	*)					TASK="test" ;;
esac

if (( ${#PASSTHROUGH[@]} )); then
	cd "${0%/*}" && \
	cd .. && \
	docker compose run --rm \
	annex bash -lc 'gulp --color "$@"' -- "${TASK}" "${PASSTHROUGH[@]}"
else
	cd "${0%/*}" && \
	cd .. && \
	docker compose run --rm \
	annex bash -lc 'gulp --color "$@"' -- "${TASK}"
fi
