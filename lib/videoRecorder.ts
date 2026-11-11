export interface OverlayData {
  timeRemainingText: string;
  dareText: string;
  captionScript: string;
  victimHandle: string;
  challengerHandle: string;
  isCritical: boolean;
}

export class VideoCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private animFrameId: number | null = null;

  constructor(width = 720, height = 1280) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
  }

  startRecording(
    videoElement: HTMLVideoElement,
    getOverlayData: () => OverlayData,
    onFinish: (blob: Blob) => void,
  ) {
    this.stopRecording();
    this.recordedChunks = [];

    const stream = this.canvas.captureStream(30);

    const audioTrack = (videoElement.srcObject as MediaStream | null)
      ?.getAudioTracks()?.[0];
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }

    const mimeType = MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };
    this.mediaRecorder.onstop = () => {
      const finalBlob = new Blob(this.recordedChunks, { type: mimeType });
      onFinish(finalBlob);
    };
    this.mediaRecorder.start();
    this.renderLoop(videoElement, getOverlayData);
  }

  private renderLoop(video: HTMLVideoElement, getOverlayData: () => OverlayData) {
    const draw = () => {
      const data = getOverlayData();
      const { width, height } = this.canvas;

      if (video.readyState >= 2) {
        this.ctx.drawImage(video, 0, 0, width, height);
      } else {
        this.ctx.fillStyle = "#07070a";
        this.ctx.fillRect(0, 0, width, height);
      }

      const grad = this.ctx.createLinearGradient(0, height - 350, 0, height);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.7)");
      grad.addColorStop(1, "rgba(0,0,0,0.95)");
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, width, height);

      this.ctx.fillStyle = "rgba(0,0,0,0.75)";
      this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
      this.ctx.lineWidth = 3;
      this.roundRect(40, 50, 260, 55, 28);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 24px sans-serif";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`TARGET: @${data.victimHandle.toUpperCase()}`, 65, 87);

      this.ctx.fillStyle = "rgba(0,0,0,0.85)";
      this.ctx.strokeStyle = data.isCritical ? "#ef4444" : "#facc15";
      this.ctx.lineWidth = 4;
      this.roundRect(40, height / 2 - 80, width - 80, 160, 30);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillStyle = data.isCritical ? "#f87171" : "#facc15";
      this.ctx.font = "900 28px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(data.captionScript, width / 2, height / 2 + 10);

      this.ctx.fillStyle = data.isCritical ? "#ef4444" : "#ffffff";
      this.ctx.shadowColor = data.isCritical ? "#ef4444" : "rgba(255,255,255,0.8)";
      this.ctx.shadowBlur = data.isCritical ? 30 : 15;
      this.ctx.font = "900 78px monospace";
      this.ctx.fillText(data.timeRemainingText, width / 2, height - 120);
      this.ctx.shadowBlur = 0;

      this.ctx.fillStyle = "#a1a1aa";
      this.ctx.font = "bold 20px monospace";
      this.ctx.fillText("BETYOULOSE.APP", width / 2, height - 40);
      this.ctx.textAlign = "left";

      this.animFrameId = requestAnimationFrame(draw);
    };
    draw();
  }

  stopRecording() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
  }
}
