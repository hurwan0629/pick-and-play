import Image from "next/image";
import Link from "next/link";
import PwaInstallButton from "./components/pwa-install-button";

export default function Home() {
  return (
    <div>
      게임 추천 앱입니다.
      <PwaInstallButton />
      <Link href="/gamelist">게임 목록으로 이동하기</Link>
    </div>
  );
}
