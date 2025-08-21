import {
  type CnAvatar,
  CnAvatarButton,
  CnBubble,
  CnCard,
  CnDialog,
  CnIcon,
  CnNavigationIcon,
  type CnReactionButton,
} from '@11thdeg/cyan-next';
import type { b } from 'vitest/dist/suite-IbNSsUWN.js';
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'cn-icon': HTMLAttributes & { noun: string };
      'cn-card': HTMLAttributes & {
        notify: boolean;
        href: string;
        noun: string;
        title: string;
        cover: string;
      };
      'cn-navigation-icon': HTMLAttributes & { noun: string; label: string };
      'cn-avatar-button': HTMLAttributes & { src: string };
      'cn-avatar': HTMLAttributes & { nick: string; src: string };
      'cn-bubble': HTMLAttributes;
      'cn-reaction-button': CnReactionButton;
      'cn-loader': HTMLAttributes;
      'cn-editor': HTMLAttributes & {
        value: string;
        onInput: (e: Event) => void;
      };
      'cn-pill': HTMLAttributes & {
        label: string;
        noun: string;
        checked: boolean;
        value: string;
      };
      'cn-menu': HTMLAttributes;
      'cn-sortable-list': HTMLAttributes & {
        items: { key: string; title: string }[];
      };
      'cn-toggle-button': HTMLAttributes & {
        label: string;
        checked: boolean;
        onChange: (event: Event) => void;
      };
    }
  }
}
