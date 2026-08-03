import './Disclaimer.css';

export default function Disclaimer() {
  return (
    <section aria-labelledby="disclaimer-heading" className="disclaimer">
      <h2 id="disclaimer-heading" className="section-title">
        안내
      </h2>
      <p>
        건강 퀘스트는 건강 습관을 기록하고 동기부여를 돕기 위한 앱이며, 의료 진단이나 치료를 제공하지
        않습니다. 신체적 이상이 있거나 건강에 대한 우려가 있다면 반드시 의료 전문가와 상담해 주세요.
      </p>
    </section>
  );
}
