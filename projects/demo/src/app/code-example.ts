import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackblitzService } from './stackblitz.service';

@Component({
  selector: 'demo-code-example',
  imports: [CommonModule],
  template: `
    <div class="code-example">
      <div class="code-example__preview">
        <ng-content></ng-content>
      </div>
      <div class="code-example__actions">
        <button type="button" class="demo-btn demo-btn--outline demo-btn--xs" (click)="toggleCode()">
          {{ showCode() ? 'Hide Code' : 'Show Code' }}
        </button>
        <button type="button" class="demo-btn demo-btn--outline demo-btn--xs" (click)="copyCode()">
          {{ copyStatus() }}
        </button>
        <button type="button" class="demo-btn demo-btn--primary demo-btn--xs code-btn--stackblitz" (click)="openInStackblitz()">
          Open Playground ⚡
        </button>
      </div>
      @if (showCode()) {
        <div class="code-example__code">
          <div class="code-tabs">
            <button
              type="button"
              class="code-tab-btn"
              [class.code-tab-btn--active]="activeTab() === 'html'"
              (click)="activeTab.set('html')"
            >
              HTML
            </button>
            <button
              type="button"
              class="code-tab-btn"
              [class.code-tab-btn--active]="activeTab() === 'ts'"
              (click)="activeTab.set('ts')"
            >
              TypeScript
            </button>
          </div>
          <pre class="code-pre"><code>{{ activeTab() === 'html' ? htmlCode() : tsCode() }}</code></pre>
        </div>
      }
    </div>
  `,
  styleUrl: './code-example.css',
})
export class CodeExampleComponent {
  title = input.required<string>();
  htmlCode = input.required<string>();
  tsCode = input.required<string>();
  cssCode = input<string>('');

  protected readonly showCode = signal(false);
  protected readonly activeTab = signal<'html' | 'ts'>('html');
  protected readonly copyStatus = signal<'Copy Code' | 'Copied!'>('Copy Code');

  private readonly stackblitzService = inject(StackblitzService);

  toggleCode() {
    this.showCode.update((v) => !v);
  }

  copyCode() {
    const code = this.activeTab() === 'html' ? this.htmlCode() : this.tsCode();
    navigator.clipboard.writeText(code).then(() => {
      this.copyStatus.set('Copied!');
      setTimeout(() => this.copyStatus.set('Copy Code'), 2000);
    });
  }

  openInStackblitz() {
    this.stackblitzService.openExample(this.title(), this.htmlCode(), this.tsCode(), this.cssCode());
  }
}
