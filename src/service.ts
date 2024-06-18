export interface Service {
  installed: boolean | null;
  enabled: boolean | null;
  active: boolean | null;
  service: string;
}
export interface Unit {
  restart: "always" | "on-failure";
  restartTimeout: number;
  description: string;
  directory: string;
  command: string;
  name: string;
}

export interface ArteryService extends Service {
  port: number | null;
  name: string;
}

export function generateUnitFile(unit: Unit) {
  // PermissionsStartOnly=true
  return `[Unit]

Description=${unit.description}
After=network.target                  

[Service] 
WorkingDirectory=${unit.directory}
ExecStart=${unit.command}
Type=exec
Restart=${unit.restart}
RestartSec=${unit.restartTimeout}s                                  
                                                    
[Install]                                                           
WantedBy=multi-user.target`;
}
