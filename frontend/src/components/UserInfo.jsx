export const UserInfo = ({ image, name, role }) => {
  return (
    <div className="flex items-center">
      <img
        src={image}
        alt="User Avatar"
        className="w-12 h-12 rounded-[50%] mr-[20px]"
      />
      <div className="text-[14px]">
        <p className="font-semibold">{name}</p>
        <p>{role}</p>
      </div>
    </div>
  );
};
