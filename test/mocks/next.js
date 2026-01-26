// Моки для next/image
const Image = ({ src, alt, width, height, ...props }) => {
  return React.createElement('img', {
    src,
    alt,
    width,
    height,
    ...props,
    style: { ...props.style, width, height },
  });
};

module.exports = { Image };
