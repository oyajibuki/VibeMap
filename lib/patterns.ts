export interface SimilarService {
  name: string;
  description: string;
  url?: string;
}

export interface PatternMatch {
  patternName: string;
  similarServices: SimilarService[];
  strengths: string[];
  considerations: string[];
  scalabilityScore: number;
}

const PATTERN_DB: Record<string, PatternMatch> = {
  "python-saas": {
    patternName: "Python SaaS (Streamlit + Supabase + Stripe)",
    similarServices: [
      {
        name: "Carrd",
        description: "Pythonベースの軽量SaaSと類似したシンプルなワンページサービス構成。",
        url: "https://carrd.co",
      },
      {
        name: "Gumroad",
        description: "クリエイターが商品を直接販売するプラットフォーム。決済+ユーザーDBの構成が類似。",
        url: "https://gumroad.com",
      },
      {
        name: "Simple Analytics",
        description: "Pythonバックエンド + PostgreSQL (Supabase) + Stripe課金の実績あるパターン。",
        url: "https://simpleanalytics.com",
      },
    ],
    strengths: ["迅速なMVP開発が可能", "Streamlitで最小限のフロントエンドコードで完結", "SupabaseでRLSによる安全なデータ管理"],
    considerations: ["ユーザー数増加時にStreamlitはスケールしにくい", "本格運用時はNext.jsへの移行を検討"],
    scalabilityScore: 6,
  },
  "python-data-app": {
    patternName: "Pythonデータアプリ (Streamlit + Supabase)",
    similarServices: [
      {
        name: "Retool",
        description: "内部ツール構築に特化したStreamlit類似のローコードツール。",
        url: "https://retool.com",
      },
      {
        name: "Streamlit Community Cloud",
        description: "同じ構成でのホスティングに最適。無料枠あり。",
        url: "https://streamlit.io/cloud",
      },
    ],
    strengths: ["Pythonエコシステムの豊富なライブラリを活用可能", "データ可視化が容易", "SupabaseでバックエンドAPIが不要"],
    considerations: ["同時接続ユーザーが増えると遅延が発生しやすい", "カスタムUIには限界がある"],
    scalabilityScore: 5,
  },
  "python-ui": {
    patternName: "Python UIアプリ (Streamlit単体)",
    similarServices: [
      {
        name: "Hugging Face Spaces",
        description: "StreamlitベースのAIデモに最適なホスティングプラットフォーム。",
        url: "https://huggingface.co/spaces",
      },
      {
        name: "Gradio",
        description: "Streamlit類似のPython UIフレームワーク。AI/MLモデルのデモに特化。",
        url: "https://gradio.app",
      },
    ],
    strengths: ["シンプルで素早く構築できる", "データサイエンティスト向けに最適化"],
    considerations: ["データ永続化にDBが必要", "本番環境では認証・セキュリティ強化を推奨"],
    scalabilityScore: 4,
  },
  "react-baas": {
    patternName: "React SPA + BaaS (Supabase/Firebase)",
    similarServices: [
      {
        name: "Twitter / X",
        description: "リアルタイムフィード + ユーザー認証の構成が類似。Supabaseがリアルタイム対応なのが強み。",
        url: "https://x.com",
      },
      {
        name: "Discord (簡易版)",
        description: "チャンネル + ユーザー管理 + リアルタイム通知の構成が類似。",
        url: "https://discord.com",
      },
      {
        name: "Indie Hackers",
        description: "コミュニティ投稿 + プロフィール + いいねの構成がこのパターンの典型例。",
        url: "https://indiehackers.com",
      },
    ],
    strengths: ["Supabaseがバックエンドを丸ごと担う設計", "リアルタイム機能が標準搭載", "認証・ストレージ・DBがオールインワン"],
    considerations: ["Supabaseの無料枠に注意（DBサイズ・リクエスト数）", "複雑なビジネスロジックはEdge Functionsへ切り出しを推奨"],
    scalabilityScore: 8,
  },
  "react-saas": {
    patternName: "React SaaS (Supabase + Stripe)",
    similarServices: [
      {
        name: "Linear",
        description: "React + Supabase + Stripe課金の成功例。モダンSaaSの標準構成。",
        url: "https://linear.app",
      },
      {
        name: "Lemon Squeezy",
        description: "クリエイター向け決済SaaS。Stripe + BaaS + Reactの組み合わせが類似。",
        url: "https://lemonsqueezy.com",
      },
      {
        name: "Cal.com",
        description: "オープンソースSaaSの代表例。Next.js + Supabase + Stripe。",
        url: "https://cal.com",
      },
    ],
    strengths: ["完全なSaaS構成", "Stripeで定期課金・都度課金どちらも対応可能", "Supabase RLSで顧客データを安全に分離"],
    considerations: ["Stripeのwebhook処理を確実に実装する必要あり", "サブスクリプション管理の複雑さに注意"],
    scalabilityScore: 9,
  },
  "hybrid-mobile": {
    patternName: "ハイブリッドモバイル (React + Capacitor)",
    similarServices: [
      {
        name: "Ionic Framework Apps",
        description: "Capacitorを使ったハイブリッドアプリの最大手エコシステム。",
        url: "https://ionicframework.com",
      },
      {
        name: "Basecamp",
        description: "Web + モバイル両対応のプロジェクト管理ツール。類似した技術戦略。",
        url: "https://basecamp.com",
      },
    ],
    strengths: ["1つのコードベースでiOS/Android/Webを同時対応", "ネイティブAPIへのアクセスが可能", "React開発者がそのままモバイル開発できる"],
    considerations: ["ネイティブアプリと比較するとパフォーマンスは劣る場合あり", "App Store審査への対応が必要"],
    scalabilityScore: 7,
  },
  "pwa": {
    patternName: "プログレッシブウェブアプリ (PWA)",
    similarServices: [
      {
        name: "Twitter Lite",
        description: "PWA化の成功例。低速回線でも動作し、インストール可能なウェブアプリ。",
        url: "https://x.com",
      },
      {
        name: "Spotify Web Player",
        description: "PWA技術を活用したオフライン再生・プッシュ通知を実現した例。",
        url: "https://open.spotify.com",
      },
    ],
    strengths: ["インストール不要でアプリ体験を提供", "オフライン対応可能", "プッシュ通知でユーザーエンゲージメント向上"],
    considerations: ["iOSでの制限（プッシュ通知等）に注意", "Service Worker管理の複雑さ"],
    scalabilityScore: 8,
  },
  "spa": {
    patternName: "シングルページアプリ (React SPA)",
    similarServices: [
      {
        name: "Netlify Drop",
        description: "シンプルなSPAのホスティングに最適。ドラッグ&ドロップでデプロイ可能。",
        url: "https://netlify.com",
      },
      {
        name: "CodeSandbox",
        description: "React SPAの典型例。軽量で高速なフロントエンドツール。",
        url: "https://codesandbox.io",
      },
      {
        name: "StackBlitz",
        description: "ブラウザ上で動くReact SPA開発環境。Viteと相性が良い。",
        url: "https://stackblitz.com",
      },
    ],
    strengths: ["シンプルで高速なフロントエンド", "Viteで高速なHMRとビルド", "デプロイが容易（静的ホスティング可）"],
    considerations: ["バックエンドが必要な機能追加時はAPIサーバーの検討が必要", "SEOが必要な場合はSSRを検討"],
    scalabilityScore: 6,
  },
  "python-script": {
    patternName: "Pythonスクリプト / データ処理ツール",
    similarServices: [
      {
        name: "Jupyter Notebooks",
        description: "データ分析・処理スクリプトの標準的なフォーマット。",
        url: "https://jupyter.org",
      },
      {
        name: "Prefect",
        description: "Pythonワークフローのオーケストレーションツール。スクリプトの本格運用に適している。",
        url: "https://prefect.io",
      },
    ],
    strengths: ["軽量で素早く目的を達成できる", "Python豊富なライブラリを活用"],
    considerations: ["UIが必要ならStreamlitへの移行を検討", "スケジュール実行はGitHub Actionsで自動化可能"],
    scalabilityScore: 3,
  },
  "ios-swiftui-premium": {
    patternName: "SwiftUI iOSアプリ (StoreKit課金 + iCloud同期)",
    similarServices: [
      {
        name: "Streaks",
        description: "習慣トラッカーの代表例。SwiftUI + StoreKit + iCloudの構成が類似。",
        url: "https://apps.apple.com/app/streaks/id963034692",
      },
      {
        name: "Habitica",
        description: "ゲーミフィケーション習慣アプリ。レベルシステムとIAP課金の構成が類似。",
        url: "https://habitica.com",
      },
      {
        name: "Forest",
        description: "習慣継続アプリの成功例。プレミアム課金 + iCloud同期の典型パターン。",
        url: "https://www.forestapp.cc",
      },
    ],
    strengths: [
      "外部依存ゼロ — Apple標準フレームワークのみで完結",
      "StoreKitで月額/年額/買い切りの3プランを柔軟に実装",
      "iCloud KVでデバイス間同期がサーバー不要で実現",
      "SwiftUIでコード量を大幅削減しつつ高品質なUIを実現",
    ],
    considerations: [
      "サーバーサイドのバリデーションがないためレシート検証を必ず実装すること",
      "iCloud KVはストレージ上限(1MB)に注意。大量データはCloudKitへ移行を検討",
      "StoreKit 2 (iOS 15+) への移行でサブスクリプション管理が大幅に簡素化される",
    ],
    scalabilityScore: 7,
  },
  "ios-swiftui-iap": {
    patternName: "SwiftUI iOSアプリ (StoreKit課金あり)",
    similarServices: [
      {
        name: "Bear",
        description: "SwiftUI + プレミアム課金の成功例。シンプルなUIと課金モデル。",
        url: "https://bear.app",
      },
      {
        name: "Things 3",
        description: "買い切り型iOSアプリの代表例。SwiftUIベースの美しいUI。",
        url: "https://culturedcode.com/things",
      },
    ],
    strengths: ["標準フレームワークのみで完結", "StoreKitで確実な課金実装"],
    considerations: ["レシート検証を必ず実装すること", "StoreKit 2移行でコードが大幅に簡素化"],
    scalabilityScore: 7,
  },
  "ios-swiftui": {
    patternName: "SwiftUI iOSアプリ (無料)",
    similarServices: [
      {
        name: "Apple公式SwiftUIサンプル",
        description: "Apple Developer公式のSwiftUIサンプルが参考になります。",
        url: "https://developer.apple.com/tutorials/swiftui",
      },
      {
        name: "Landmarks (Apple Tutorial App)",
        description: "SwiftUI入門の定番チュートリアルアプリ。構成が非常に類似。",
        url: "https://developer.apple.com/tutorials/swiftui/creating-and-combining-views",
      },
    ],
    strengths: ["シンプルな構成でメンテナンスが容易", "Apple標準のみで審査リスクが低い"],
    considerations: ["収益化したい場合はStoreKit追加を検討", "データ同期が必要なら iCloud KV または CloudKit を追加"],
    scalabilityScore: 6,
  },
  "ios-uikit": {
    patternName: "UIKit iOSアプリ",
    similarServices: [
      {
        name: "Instagram (旧バージョン)",
        description: "UIKitベースのiOSアプリの代表例。",
        url: "https://apps.apple.com/app/instagram/id389801252",
      },
    ],
    strengths: ["成熟したフレームワークで情報が豊富", "複雑なカスタムUIに対応しやすい"],
    considerations: ["SwiftUIへの移行でコードを大幅削減できる可能性あり", "新規開発はSwiftUI推奨"],
    scalabilityScore: 6,
  },
  "ios-swift": {
    patternName: "Swift iOSアプリ",
    similarServices: [
      {
        name: "Swift Playgrounds",
        description: "Swiftで作られたApple公式の学習アプリ。",
        url: "https://developer.apple.com/swift-playgrounds",
      },
    ],
    strengths: ["Apple標準のみで完結", "App Store審査リスクが低い"],
    considerations: ["UIフレームワーク(SwiftUI/UIKit)の選択を明確にすること"],
    scalabilityScore: 6,
  },
  "unknown": {
    patternName: "汎用ウェブアプリ",
    similarServices: [
      {
        name: "Vercel Templates",
        description: "様々な技術スタックのテンプレートが揃っている。構成の参考に。",
        url: "https://vercel.com/templates",
      },
    ],
    strengths: ["構成の詳細をAI評価で詳しく解析できます"],
    considerations: ["依存関係ファイル（package.json / requirements.txt）を含めると精度が向上します"],
    scalabilityScore: 5,
  },
};

export function matchPattern(projectType: string): PatternMatch {
  return PATTERN_DB[projectType] || PATTERN_DB["unknown"];
}
