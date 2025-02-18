.PHONY: install-frontend
install-frontend:
	cd web && npm install

.PHONY: install-frontend-ci
install-frontend-ci:
	cd web && npm ci --omit=optional --ignore-scripts

.PHONY: install-frontend-ci-clean
install-frontend-ci-clean: install-frontend-ci
	cd web && npm cache clean

.PHONY: build-frontend
build-frontend:
	cd web && npm run build

.PHONY: start-frontend
start-frontend:
	cd web && npm run start

.PHONY: start-console
start-console:
	./scripts/start-console.sh

.PHONY: i18n-frontend
i18n-frontend:
	cd web && npm run i18n

.PHONY: lint-frontend
lint-frontend:
	cd web && npm run lint

.PHONY: lint-backend
lint-backend:
	go mod tidy
	go fmt ./cmd/
	go fmt ./pkg/

.PHONY: install-backend
install-backend:
	go mod download

.PHONY: build-backend
build-backend:
	go build $(BUILD_OPTS) -mod=readonly -o plugin-backend cmd/plugin-backend.go

.PHONY: start-backend
start-backend:
	go run ./cmd/plugin-backend.go -port='9001' -config-path='./web/dist' -static-path='./web/dist' -plugin-config-path='ct.yaml'

.PHONY: build-image
build-image:
	./scripts/build-image.sh

.PHONY: install
install:
	make install-frontend && make install-backend

.PHONY: update-plugin-name
update-plugin-name:
	./scripts/update-plugin-name.sh

export REGISTRY_ORG?=openshift-observability-ui
export TAG?=latest
export PLUGIN_NAME?=monitoring-plugin
IMAGE=quay.io/${REGISTRY_ORG}/monitoring-plugin:${TAG}

.PHONY: deploy
deploy:
	make lint-backend
	PUSH=1 scripts/build-image.sh
	helm uninstall $(PLUGIN_NAME) -n $(PLUGIN_NAME)-ns || true
	helm install $(PLUGIN_NAME) charts/openshift-console-plugin -n monitoring-plugin-ns --create-namespace --set plugin.image=$(IMAGE)

.PHONY: deploy-acm
deploy-acm:
	./scripts/deploy-acm.sh
