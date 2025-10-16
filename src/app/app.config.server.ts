import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig as browserConfig } from './app.config';

export const appServerConfig: ApplicationConfig = mergeApplicationConfig(browserConfig, {
  providers: [provideServerRendering()],
});
