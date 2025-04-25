
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const mouse = { x: width / 2, y: height / 2 };
    const particleCount = 50;

    const particles = [];

    class Particle {
      constructor() {
        this.homeX = Math.random() * width;
        this.homeY = Math.random() * height;
        this.x = this.homeX;
        this.y = this.homeY;
        this.radius = Math.random() * 2.1 + 1.1;
        this.vx = 0;
        this.vy = 0;
        const colors = [
          'rgba(50, 100, 255, 0.5)',
          'rgba(120, 100, 255, 0.5)',
          'rgba(100, 120, 150, 0.5)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const avoidRadius = 80;

        // Avoid mouse if close
        if (dist < avoidRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (avoidRadius - dist) / avoidRadius;
          this.vx += Math.cos(angle) * force * 1.5;
          this.vy += Math.sin(angle) * force * 1.5;
        } else {
          // Move back to home position when mouse is far
          const homeDX = this.homeX - this.x;
          const homeDY = this.homeY - this.y;
          this.vx += homeDX * 0.01;
          this.vy += homeDY * 0.01;
        }

        // Apply velocity with damping
        this.vx *= 0.9;
        this.vy *= 0.9;
        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {


    const dx = particles[i].x - particles[j].x;
    const dy = particles[i].y - particles[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 200) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(120, 120, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();
    }
  }
}

      


      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    });

    window.addEventListener('resize', () => {
  const oldWidth = width;
  const oldHeight = height;

  width = window.innerWidth;
  height = window.innerHeight + window.scrollY;;
  canvas.width = width;
  canvas.height = height;

  // Scale particles’ home positions proportionally
  particles.forEach(p => {
    p.homeX = (p.homeX / oldWidth) * width;
    p.homeY = (p.homeY / oldHeight) * height;
  });
});


