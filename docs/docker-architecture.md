# Arsitektur Docker Multi-Container LenteraPustaka

Berikut adalah diagram arsitektur yang mendeskripsikan bagaimana sistem LenteraPustaka diisolasi dan saling terhubung menggunakan Docker. Seluruh *container* ini berjalan di atas jaringan internal yang sama (`lentera_net`) sehingga dapat saling berkomunikasi secara langsung.

```mermaid
flowchart TD
    subgraph DOCKER_NET ["🐳 Docker Network: lentera_net"]
        
        subgraph FE_C ["Frontend Container (lentera_fe)"]
            FE["Nginx + React Build<br/>Image: x3naline/lentera:fe-v1<br/>Port Internal: 80"]
        end
        
        subgraph BE_C ["Backend Container (lentera_be)"]
            BE["FastAPI App<br/>Image: x3naline/lentera:be-v2<br/>Port Internal: 8000<br/>ENV: env-file .env.docker"]
        end
        
        subgraph DB_C ["Database Container (db)"]
            DB["PostgreSQL 16<br/>Image: postgres:16-alpine<br/>Port Internal: 5432<br/>ENV: POSTGRES_DB=lentera_pustaka"]
            VOL[("💾 Named Volume:<br/>lentera_data")]
        end
        
        %% Koneksi antar container di dalam network
        BE -->|"Koneksi SQLAlchemy<br/>(postgresql://...db:5432/...)"| DB
        DB ---|"Persistent Storage"| VOL
    end

    %% Koneksi dari luar Docker (Host Machine)
    USER["👤 Browser (Host Machine)"] -->|"Akses Web<br/>http://localhost:3000"| FE
    USER -->|"Akses API/Docs<br/>http://localhost:8000/docs"| BE

    classDef containerFill fill:#f9f9f9,stroke:#333,stroke-width:2px;
    class FE_C,BE_C,DB_C containerFill;
    style DOCKER_NET fill:#DEEBF7,stroke:#2E75B6,stroke-width:2px,stroke-dasharray: 5 5
    style VOL fill:#fff2cc,stroke:#d6b656,stroke-width:2px
```