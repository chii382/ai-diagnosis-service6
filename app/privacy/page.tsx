import { InteriorShell } from "@/app/components/InteriorShell";

export default function PrivacyPage() {
  return (
    <InteriorShell wide eyebrow="PRIVACY POLICY" title="プライバシーポリシー" description="お客様の情報の取り扱いについてご案内します。">
      <article className="legal-card sanctuary-card">
        <p className="legal-note">本ページは公開準備用の雛形です。正式公開前に、実際の運用内容と専門家の確認を反映してください。</p>
        <section>
          <h2>1．取得する情報</h2>
          <p>本サービスでは、氏名、メールアドレス、プロフィール情報、診断への回答、診断結果、ログイン情報、サービスの利用履歴および決済に必要な情報を取得する場合があります。</p>
        </section>
        <section>
          <h2>2．利用目的</h2>
          <p>取得した情報は、本人確認、診断結果の作成・保存、サービス提供、料金請求、お問い合わせ対応、品質改善、不正利用の防止および重要なお知らせのために利用します。</p>
        </section>
        <section>
          <h2>3．外部サービスの利用</h2>
          <p>認証、決済、AI分析、データ保管およびエラー監視のため、Google、Stripe、OpenAI、MongoDB、Sentryなどの外部サービスを利用する場合があります。各サービスでは、それぞれのプライバシーポリシーに基づいて情報が取り扱われます。</p>
        </section>
        <section>
          <h2>4．第三者提供</h2>
          <p>法令に基づく場合またはサービス提供に必要な業務委託先へ提供する場合を除き、ご本人の同意なく個人情報を第三者へ提供しません。</p>
        </section>
        <section>
          <h2>5．安全管理</h2>
          <p>個人情報への不正アクセス、紛失、改ざんおよび漏えいを防ぐため、合理的な安全管理措置を講じます。</p>
        </section>
        <section>
          <h2>6．開示・訂正・削除</h2>
          <p>ご本人から個人情報の開示、訂正または削除をご希望いただいた場合は、本人確認のうえ合理的な範囲で対応します。</p>
        </section>
        <section>
          <h2>7．改定</h2>
          <p>本ポリシーは必要に応じて改定します。重要な変更がある場合は、本サービス上でお知らせします。</p>
        </section>
        <section>
          <h2>8．お問い合わせ</h2>
          <p>個人情報の取り扱いに関するお問い合わせ先は、正式公開までに本ページへ記載します。</p>
        </section>
        <p>制定日：2026年8月23日</p>
      </article>
    </InteriorShell>
  );
}
