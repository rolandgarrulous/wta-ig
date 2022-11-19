const createGraph = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const radius = 25;

  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const linkArc = d =>`M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`;

  function drag(simulation) {    
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-2 * radius))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .force('collide', d3.forceCollide(d => 2 * radius));

  const svg = d3.select('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

  const link = svg.append('g')
    .attr('fill', 'none')
    .attr('stroke-width', 1.5)
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('stroke', '#999')
    .attr('display', 'none');

  const node = svg.append('g')
    .attr('fill', 'currentColor')
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
    .attr('opacity', 1)
    .selectAll('g')
    .data(nodes)
    .join('g')
    .call(drag(simulation))
    .on('mouseenter', (e, d) => {
      link.filter(l => l.source.id === d.id)
        .attr('stroke', d => d.mutual ? '#7814FF' : '#14C8FF')
        .attr('marker-end', d => {
          const markerId = d.mutual ? 'mutual' : 'followedBy';
          return `url(${new URL(`#arrow-${markerId}`, location)})`
        })
        .attr('display', 'block');
      link.filter(l => l.target.id === d.id)
        .attr('stroke', d => d.mutual ? '#7814FF' : '#FF146A')
        .attr('marker-end', d => {
          const markerId = d.mutual ? 'mutual' : 'following';
          return `url(${new URL(`#arrow-${markerId}`, location)})`
        })
        .attr('display', 'block');

      node.filter(n => !d.related.includes(n.id)).attr('opacity', 0.2);
    })
    .on('mouseleave', (e, d) => {
      link.attr('display', 'none');
      node.attr('opacity', 1);
    })
    .on('dblclick', (e, d) => window.open(`https://www.instagram.com/${d.id}`, '_blank'));

  node.append('circle')
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5)
    .attr('r', radius)
    .attr('fill', d => '#000');

  node.append('svg:image')
    .attr('xlink:href', d => `images/${d.id}.png`)
    .attr('x', -radius)
    .attr('y', -radius)
    .attr('height', radius * 2)
    .attr('width', radius * 2);
  
  node.append('text')
    .attr('y', radius * 1.5)
    .attr('text-anchor', 'middle')
    .text(d => `${d.flag} ${d.lastName}`)
    .clone(true).lower()
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 3);

  simulation.on('tick', () => {
    link.attr('d', linkArc);
    node.attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('cx', d => {
        if (d.x < (-width / 2 + 2 * radius)) {
          return d.x = -width / 2 + 2 * radius;
        } else if (d.x > (width / 2 - 2 * radius)) {
          return d.x = width / 2 - 2 * radius;
        } else {
          return d.x;
        }
      })
      .attr('cy', d => {
        if (d.y < (-height / 2 + 2 * radius)) {
          return d.y = -height / 2 + 2 * radius;
        } else if (d.y > (height / 2 - 2 * radius)) {
          return d.y = height / 2 - 2 * radius;
        } else {
          return d.y;
        }
      });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  createGraph();
});
